import graphiteCLIRoutes from "@screenplaydev/graphite-cli-routes";
import * as t from "@screenplaydev/retype";
import { request } from "@screenplaydev/retyped-routes";
import chalk from "chalk";
import { execSync } from "child_process";
import fs from "fs-extra";
import prompts from "prompts";
import tmp from "tmp";
import { API_SERVER } from "../lib/api";
import { repoConfig, userConfig } from "../lib/config";
import {
  ExitFailedError,
  PreconditionsFailedError,
  ValidationFailedError,
} from "../lib/errors";
import { globalArgs } from "../lib/global-arguments";
import { currentBranchPrecondition } from "../lib/preconditions";
import {
  gpExecSync,
  logError,
  logInfo,
  logNewline,
  logSuccess,
  logWarn,
} from "../lib/utils";
import { getPRTemplate } from "../lib/utils/pr_templates";
import Branch from "../wrapper-classes/branch";
import Commit from "../wrapper-classes/commit";
import { TScope } from "./scope";
import { validate } from "./validate";

type TSubmittedPRInfo = t.UnwrapSchemaMap<
  typeof graphiteCLIRoutes.submitPullRequests.response
>;

export async function submitAction(scope: TScope): Promise<void> {
  const cliAuthToken = getCLIAuthToken();
  const repoName = repoConfig.getRepoName();
  const repoOwner = repoConfig.getRepoOwner();

  try {
    validate(scope);
  } catch {
    throw new ValidationFailedError(`Validation failed before submitting.`);
  }

  const currentBranch = currentBranchPrecondition();
  const branchesToSubmit = await getBranchesToSubmit(currentBranch);

  pushBranchesToRemote(branchesToSubmit);

  const submittedPRInfo = await submitPRsForBranches({
    branches: branchesToSubmit,
    cliAuthToken: cliAuthToken,
    repoOwner: repoOwner,
    repoName: repoName,
  });
  if (submittedPRInfo === null) {
    throw new ExitFailedError("Failed to submit commits. Please try again.");
  }

  printSubmittedPRInfo(submittedPRInfo.prs);
  saveBranchPRInfo(submittedPRInfo.prs);
}

function getCLIAuthToken(): string {
  const token = userConfig.getAuthToken();
  if (!token || token.length === 0) {
    throw new PreconditionsFailedError(
      "Please authenticate your Graphite CLI by visiting https://app.graphite.dev/activate."
    );
  }
  return token;
}

async function getBranchesToSubmit(currentBranch: Branch): Promise<Branch[]> {
  const stackOfBranches = await getDownstackInclusive(currentBranch);

  if (stackOfBranches.length === 0) {
    logWarn("No downstack branches found.");
    return [];
  }

  return stackOfBranches.filter((branch) => {
    return branch.getCommitSHAs().length > 0;
  });
}

async function getDownstackInclusive(topOfStack: Branch): Promise<Branch[]> {
  const downstack: Branch[] = [];

  let currentBranch = topOfStack;
  while (
    currentBranch != null &&
    currentBranch != undefined &&
    // don't include trunk as part of the stack
    currentBranch.getParentFromMeta() != undefined
  ) {
    downstack.push(currentBranch);

    const parentBranchName: string = currentBranch.getParentFromMeta()!.name;
    currentBranch = await Branch.branchWithName(parentBranchName);
  }

  downstack.reverse();

  return downstack;
}

function pushBranchesToRemote(branches: Branch[]): void {
  logInfo("Pushing branches to remote...");
  logNewline();

  branches.forEach((branch) => {
    logInfo(`Pushing ${branch.name}...`);
    gpExecSync(
      {
        command: `git push origin -f ${branch.name}`,
      },
      (_) => {
        throw new ExitFailedError(
          `Failed to push changes for ${branch.name} to origin. Aborting...`
        );
      }
    );
    logNewline();
  });
}

async function submitPRsForBranches(args: {
  branches: Branch[];
  cliAuthToken: string;
  repoOwner: string;
  repoName: string;
}): Promise<TSubmittedPRInfo | null> {
  const branchPRInfo: t.UnwrapSchemaMap<
    typeof graphiteCLIRoutes.submitPullRequests.params
  >["prs"] = [];
  for (const branch of args.branches) {
    // The branch here should always have a parent - above, the branches we've
    // gathered should exclude trunk which ensures that every branch we're submitting
    // a PR for has a valid parent.
    const parentBranchName = branch.getParentFromMeta()!.name;

    const previousPRInfo = branch.getPRInfo();
    if (previousPRInfo) {
      branchPRInfo.push({
        action: "update",
        head: branch.name,
        base: parentBranchName,
        prNumber: previousPRInfo.number,
      });
    } else {
      const { title, body } = await getPRTitleAndBody({
        branch: branch,
        parentBranchName: parentBranchName,
      });
      branchPRInfo.push({
        action: "create",
        head: branch.name,
        base: parentBranchName,
        title: title,
        body: body,
      });
    }
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
      return response;
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
    throw new ExitFailedError(`Failed to submit PRs: ${error.message}`);
  }
}

async function getPRTitleAndBody(args: {
  branch: Branch;
  parentBranchName: string;
}): Promise<{
  title: string;
  body: string | undefined;
}> {
  logInfo(`Creating PR for ${args.branch.name} ▸ ${args.parentBranchName}:`);
  const interactive = globalArgs.interactive;

  let title = inferPRTitle(args.branch);
  if (interactive) {
    const response = await prompts({
      type: "text",
      name: "title",
      message: "Title",
      initial: title,
    });
    title = response.title;
  }

  let body = await getPRTemplate();
  const hasPRTemplate = body !== undefined;
  if (interactive) {
    const response = await prompts({
      type: "select",
      name: "body",
      message: "Body",
      choices: [
        { title: "Edit Body (using vim)", value: "edit" },
        {
          title: `Skip${hasPRTemplate ? ` (just paste template)` : ""}`,
          value: "skip",
        },
      ],
    });
    if (response.body === "edit") {
      body = await editPRBody(body ?? "");
    }
  }

  // Log newline at the end to create some visual separation to the next
  // interactive PR section or status output.
  logNewline();

  return {
    title: title,
    body: body,
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

async function editPRBody(initial: string): Promise<string> {
  const file = tmp.fileSync();
  fs.writeFileSync(file.name, initial);
  execSync(`\${GIT_EDITOR:-vi} ${file.name}`, { stdio: "inherit" });
  const contents = fs.readFileSync(file.name).toString();
  file.removeCallback();
  return contents;
}

function printSubmittedPRInfo(
  prs: t.UnwrapSchemaMap<
    typeof graphiteCLIRoutes.submitPullRequests.response
  >["prs"]
): void {
  prs.forEach((pr) => {
    logSuccess(pr.head);

    let status: string = pr.status;
    switch (pr.status) {
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
        assertUnreachable(pr);
    }

    if ("error" in pr) {
      logError(pr.error);
    } else {
      console.log(`${pr.prURL} (${status})`);
    }

    logNewline();
  });
}

function saveBranchPRInfo(
  prs: t.UnwrapSchemaMap<
    typeof graphiteCLIRoutes.submitPullRequests.response
  >["prs"]
): void {
  prs.forEach(async (pr) => {
    if (pr.status === "updated" || pr.status === "created") {
      const branch = await Branch.branchWithName(pr.head);
      branch.setPRInfo({
        number: pr.prNumber,
        url: pr.prURL,
      });
    }
  });
}

// eslint-disable-next-line @typescript-eslint/no-empty-function
function assertUnreachable(arg: never): void {}
