import graphiteCLIRoutes from "@screenplaydev/graphite-cli-routes";
import * as t from "@screenplaydev/retype";
import { request } from "@screenplaydev/retyped-routes";
import chalk from "chalk";
import { execSync } from "child_process";
import fs from "fs-extra";
import prompts from "prompts";
import tmp from "tmp";
import { API_SERVER } from "../lib/api";
import { execStateConfig, repoConfig } from "../lib/config";
import {
  ExitFailedError,
  KilledError,
  PreconditionsFailedError,
  ValidationFailedError
} from "../lib/errors";
import {
  cliAuthPrecondition,
  currentBranchPrecondition
} from "../lib/preconditions";
import {
  gpExecSync,
  logError,
  logInfo,
  logNewline,
  logSuccess
} from "../lib/utils";
import { getDefaultEditor } from "../lib/utils/default_editor";
import { getPRTemplate } from "../lib/utils/pr_templates";
import { Unpacked } from "../lib/utils/ts_helpers";
import { MetaStackBuilder } from "../wrapper-classes";
import Branch from "../wrapper-classes/branch";
import Commit from "../wrapper-classes/commit";
import { TBranchPRInfo } from "../wrapper-classes/metadata_ref";
import { TScope } from "./scope";
import { validate } from "./validate";

type TSubmitScope = TScope | "BRANCH";

export async function submitAction(args: {
  scope: TSubmitScope;
  editPRFieldsInline: boolean;
  createNewPRsAsDraft: boolean | undefined;
}): Promise<void> {
  if (!execStateConfig.interactive()) {
    args.editPRFieldsInline = false;
    args.createNewPRsAsDraft = true;
  }

  const cliAuthToken = cliAuthPrecondition();
  const repoName = repoConfig.getRepoName();
  const repoOwner = repoConfig.getRepoOwner();

  try {
    if (args.scope !== "BRANCH") {
      validate(args.scope);
    }
  } catch {
    throw new ValidationFailedError(`Validation failed before submitting.`);
  }

  const branchesToSubmit = getBranchesToSubmit({
    currentBranch: currentBranchPrecondition(),
    scope: args.scope,
  });
  const branchesPushedToRemote = pushBranchesToRemote(branchesToSubmit);
  const submittedPRInfo = await submitPRsForBranches({
    branches: branchesToSubmit,
    branchesPushedToRemote: branchesPushedToRemote,
    cliAuthToken: cliAuthToken,
    repoOwner: repoOwner,
    repoName: repoName,
    editPRFieldsInline: args.editPRFieldsInline,
    createNewPRsAsDraft: args.createNewPRsAsDraft,
  });
  if (submittedPRInfo === null) {
    throw new ExitFailedError("Failed to submit commits. Please try again.");
  }

  printSubmittedPRInfo(submittedPRInfo);
  saveBranchPRInfo(submittedPRInfo);
}

function getBranchesToSubmit(args: {
  currentBranch: Branch;
  scope: TSubmitScope;
}): Branch[] {
  switch (args.scope) {
    case "DOWNSTACK":
      return new MetaStackBuilder()
        .downstackFromBranch(args.currentBranch)
        .branches()
        .filter((b) => !b.isTrunk());
    case "FULLSTACK":
      return new MetaStackBuilder()
        .fullStackFromBranch(args.currentBranch)
        .branches()
        .filter((b) => !b.isTrunk());
    case "UPSTACK":
      return new MetaStackBuilder()
        .upstackInclusiveFromBranchWithParents(args.currentBranch)
        .branches()
        .filter((b) => !b.isTrunk());
    case "BRANCH":
      return [args.currentBranch];
    default:
      assertUnreachable(args.scope);
      return [];
  }
}

function pushBranchesToRemote(branches: Branch[]): Branch[] {
  const branchesPushedToRemote: Branch[] = [];

  logInfo("Pushing branches to remote...");
  logNewline();

  branches.forEach((branch) => {
    logInfo(`Pushing ${branch.name}...`);

    const output = gpExecSync(
      {
        // redirecting stderr to stdout here because 1) git prints the output
        // of the push command to stderr 2) we want to analyze it but Node's
        // execSync makes analyzing stderr extremely challenging
        command: `git push origin -f ${branch.name} 2>&1`,
        options: {
          printStdout: true,
        },
      },
      (err) => {
        throw new ExitFailedError(
          `Failed to push changes for ${branch.name} to origin. Aborting...`,
          err
        );
      }
    )
      .toString()
      .trim();

    if (!output.includes("Everything up-to-date")) {
      branchesPushedToRemote.push(branch);
    }
  });

  return branchesPushedToRemote;
}

type TSubmittedPRRequest = Unpacked<
  t.UnwrapSchemaMap<typeof graphiteCLIRoutes.submitPullRequests.params>["prs"]
>;
type TSubmittedPRResponse = Unpacked<
  t.UnwrapSchemaMap<typeof graphiteCLIRoutes.submitPullRequests.response>["prs"]
>;

type TSubmittedPR = {
  request: TSubmittedPRRequest;
  response: TSubmittedPRResponse;
};

export async function submitPRsForBranches(args: {
  branches: Branch[];
  branchesPushedToRemote: Branch[];
  cliAuthToken: string;
  repoOwner: string;
  repoName: string;
  editPRFieldsInline: boolean;
  createNewPRsAsDraft: boolean | undefined;
}): Promise<TSubmittedPR[]> {
  const branchPRInfo: t.UnwrapSchemaMap<
    typeof graphiteCLIRoutes.submitPullRequests.params
  >["prs"] = [];
  for (const branch of args.branches) {
    if (branch.getPRInfo()?.state === "MERGED") {
      continue;
    }

    // The branch here should always have a parent - above, the branches we've
    // gathered should exclude trunk which ensures that every branch we're submitting
    // a PR for has a valid parent.
    const parentBranchName = getBranchBaseName(branch);

    const previousPRInfo = branch.getPRInfo();
    if (previousPRInfo === undefined) {
      const { title, body, draft } = await getPRCreationInfo({
        branch: branch,
        parentBranchName: parentBranchName,
        editPRFieldsInline: args.editPRFieldsInline,
        createNewPRsAsDraft: args.createNewPRsAsDraft,
      });
      branchPRInfo.push({
        action: "create",
        head: branch.name,
        base: parentBranchName,
        title: title,
        body: body,
        draft: draft,
      });
    } else if (
      shouldUpdatePR({
        branch: branch,
        previousBranchPRInfo: previousPRInfo,
        branchesPushedToRemote: args.branchesPushedToRemote,
      })
    ) {
      branchPRInfo.push({
        action: "update",
        head: branch.name,
        base: parentBranchName,
        prNumber: previousPRInfo.number,
      });
    }
  }

  if (branchPRInfo.length === 0) {
    return [];
  }

  try {
    const response = await request.requestWithArgs(
      API_SERVER,
      graphiteCLIRoutes.submitPullRequests,
      {
        authToken: args.cliAuthToken,
        repoOwner: args.repoOwner,
        repoName: args.repoName,
        prs: branchPRInfo,
      }
    );

    if (response._response.status === 200 && response._response.body !== null) {
      const requests: { [head: string]: TSubmittedPRRequest } = {};
      branchPRInfo.forEach((prRequest) => {
        requests[prRequest.head] = prRequest;
      });

      return response.prs.map((prResponse) => {
        return {
          request: requests[prResponse.head],
          response: prResponse,
        };
      });
    }

    if (response._response.status === 401) {
      throw new PreconditionsFailedError(
        "invalid/expired Graphite auth token.\n\nPlease obtain a new auth token by visiting https://app.graphite.dev/activate."
      );
    }

    throw new ExitFailedError(
      `unexpected server response (${
        response._response.status
      }).\n\nResponse: ${JSON.stringify(response)}`
    );
  } catch (error) {
    throw new ExitFailedError(`Failed to submit PRs`, error);
  }
}

function getBranchBaseName(branch: Branch): string {
  return branch.getParentFromMeta()!.name;
}

/**
 * For now, we only allow users to update the following PR properties which
 * necessitate a PR update:
 * - the PR base
 * - the PR's code contents
 *
 * Notably, we do not yet allow users to update the PR title, body, etc.
 *
 * Therefore, we should only update the PR iff either of these properties
 * differ from our stored data on the previous PR submission.
 */
function shouldUpdatePR(args: {
  branch: Branch;
  previousBranchPRInfo: TBranchPRInfo;
  branchesPushedToRemote: Branch[];
}): boolean {
  // base was updated
  if (getBranchBaseName(args.branch) !== args.previousBranchPRInfo.base) {
    return true;
  }

  // code was updated
  if (
    args.branchesPushedToRemote.find(
      (branchPushedToRemote) => branchPushedToRemote.name === args.branch.name
    )
  ) {
    return true;
  }

  if (execStateConfig.outputDebugLogs()) {
    logInfo(
      `No PR update needed for ${args.branch.name}: PR base and code unchanged.`
    );
  }

  return false;
}

async function getPRCreationInfo(args: {
  branch: Branch;
  parentBranchName: string;
  editPRFieldsInline: boolean;
  createNewPRsAsDraft: boolean | undefined;
}): Promise<{
  title: string;
  body: string | undefined;
  draft: boolean;
}> {
  logInfo(
    `Creating Pull Request for ${chalk.yellow(args.branch.name)} ▸ ${
      args.parentBranchName
    }:`
  );

  let title = inferPRTitle(args.branch);
  if (args.editPRFieldsInline) {
    const response = await prompts(
      {
        type: "text",
        name: "title",
        message: "Title",
        initial: title,
      },
      {
        onCancel: () => {
          throw new KilledError();
        },
      }
    );
    title = response.title ?? title;
  }

  let body = await getPRTemplate();
  const hasPRTemplate = body !== undefined;
  if (args.editPRFieldsInline) {
    const defaultEditor = getDefaultEditor();
    const response = await prompts(
      {
        type: "select",
        name: "body",
        message: "Body",
        choices: [
          { title: `Edit Body (using ${defaultEditor})`, value: "edit" },
          {
            title: `Skip${hasPRTemplate ? ` (just paste template)` : ""}`,
            value: "skip",
          },
        ],
      },
      {
        onCancel: () => {
          throw new KilledError();
        },
      }
    );
    if (response.body === "edit") {
      body = await editPRBody({
        initial: body ?? "",
        editor: defaultEditor,
      });
    }
  }

  let draft: boolean;
  if (args.createNewPRsAsDraft === undefined) {
    const response = await prompts(
      {
        type: "select",
        name: "draft",
        message: "Submit",
        choices: [
          { title: "Publish Pull Request", value: "publish" },
          { title: "Create Draft Pull Request", value: "draft" },
        ],
      },
      {
        onCancel: () => {
          throw new KilledError();
        },
      }
    );
    draft = response.draft === "draft" ? true : false;
  } else {
    draft = args.createNewPRsAsDraft;
  }

  // Log newline at the end to create some visual separation to the next
  // interactive PR section or status output.
  logNewline();

  return {
    title: title,
    body: body,
    draft: draft,
  };
}

function inferPRTitle(branch: Branch) {
  // Only infer the title from the commit if the branch has just 1 commit.
  const singleCommitMessage = getSingleCommitMessageOnBranch(branch);
  if (singleCommitMessage !== null) {
    return singleCommitMessage;
  }

  return `Merge ${branch.name} into ${branch.getParentFromMeta()!.name}`;
}

function getSingleCommitMessageOnBranch(branch: Branch): string | null {
  const commits = branch.getCommitSHAs();
  if (commits.length !== 1) {
    return null;
  }
  const commit = new Commit(commits[0]);
  const commitMessage = commit.message();
  return commitMessage.length > 0 ? commitMessage : null;
}

async function editPRBody(args: {
  initial: string;
  editor: string;
}): Promise<string> {
  const file = tmp.fileSync();
  fs.writeFileSync(file.name, args.initial);
  execSync(`${args.editor} ${file.name}`, { stdio: "inherit" });
  const contents = fs.readFileSync(file.name).toString();
  file.removeCallback();
  return contents;
}

function printSubmittedPRInfo(prs: TSubmittedPR[]): void {
  if (prs.length === 0) {
    logInfo("All PRs up-to-date on GitHub; no PR updates necessary.");
    return;
  }

  prs.forEach((pr) => {
    logSuccess(pr.response.head);

    let status: string = pr.response.status;
    switch (pr.response.status) {
      case "updated":
        status = chalk.yellow(status);
        break;
      case "created":
        status = chalk.green(status);
        break;
      case "error":
        status = chalk.red(status);
        break;
      default:
        assertUnreachable(pr.response);
    }

    if ("error" in pr.response) {
      logError(pr.response.error);
    } else {
      console.log(`${pr.response.prURL} (${status})`);
    }

    logNewline();
    logInfo(`See your full stack on https://app.graphite.dev`);
  });
}

export function saveBranchPRInfo(prs: TSubmittedPR[]): void {
  prs.forEach(async (pr) => {
    if (pr.response.status === "updated" || pr.response.status === "created") {
      const branch = await Branch.branchWithName(pr.response.head);
      branch.setPRInfo({
        number: pr.response.prNumber,
        url: pr.response.prURL,
        base: pr.request.base,
      });
    }
  });
}

// eslint-disable-next-line @typescript-eslint/no-empty-function
function assertUnreachable(arg: never): void {}
