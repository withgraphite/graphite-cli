import graphiteCLIRoutes from "@screenplaydev/graphite-cli-routes";
import * as t from "@screenplaydev/retype";
import { request } from "@screenplaydev/retyped-routes";
import chalk from "chalk";
import { API_SERVER } from "../../lib/api";
import { execStateConfig, repoConfig } from "../../lib/config";
import {
  ExitFailedError,
  PreconditionsFailedError,
  ValidationFailedError,
} from "../../lib/errors";
import {
  cliAuthPrecondition,
  currentBranchPrecondition,
} from "../../lib/preconditions";
import { syncPRInfoForBranches } from "../../lib/sync/pr_info";
import {
  gpExecSync,
  logError,
  logInfo,
  logNewline,
  logSuccess,
} from "../../lib/utils";
import { Unpacked } from "../../lib/utils/ts_helpers";
import { MetaStackBuilder } from "../../wrapper-classes";
import Branch from "../../wrapper-classes/branch";
import { TBranchPRInfo } from "../../wrapper-classes/metadata_ref";
import { TScope } from "./../scope";
import { validate } from "./../validate";
import { getPRBody } from "./pr_body";
import { getPRDraftStatus } from "./pr_draft";
import { getPRTitle } from "./pr_title";

type TSubmitScope = TScope | "BRANCH";

export async function submitAction(args: {
  scope: TSubmitScope;
  editPRFieldsInline: boolean;
  createNewPRsAsDraft: boolean | undefined;
  dryRun: boolean;
}): Promise<void> {
  if (args.dryRun) {
    logInfo(
      chalk.yellow(
        `Running submit in 'dry-run' mode. No branches will be pushed and no PRs will be opened or updated.`
      )
    );
    logNewline();
  }

  if (!execStateConfig.interactive()) {
    args.editPRFieldsInline = false;
    args.createNewPRsAsDraft = true;
  }

  const cliAuthToken = cliAuthPrecondition();
  const repoName = repoConfig.getRepoName();
  const repoOwner = repoConfig.getRepoOwner();

  try {
    // In order to keep the step numbering consistent between the branch and
    // stack submit cases, always print the below status. We can think of this
    // as the validation just always passing in the branch case.
    //
    // Two spaces between the text and icon is intentional for spacing
    // purposes.
    logInfo(
      chalk.blueBright(
        `✏️  [1/4] Validating Graphite stack before submitting...`
      )
    );
    if (args.scope !== "BRANCH") {
      validate(args.scope);
    }
    logNewline();
  } catch {
    throw new ValidationFailedError(`Validation failed before submitting.`);
  }

  const branchesToSubmit = getBranchesToSubmit({
    currentBranch: currentBranchPrecondition(),
    scope: args.scope,
  });

  // Force a sync to link any PRs that have remote equivalents, but weren't
  // previously tracked with Graphite.
  await syncPRInfoForBranches(branchesToSubmit);

  logInfo(
    chalk.blueBright(
      "🥞 [2/4] Preparing to submit PRs for the following branches..."
    )
  );
  branchesToSubmit.forEach((branch) => {
    let operation;
    if (branch.getPRInfo() !== undefined) {
      operation = "update";
    } else {
      operation = "create";
    }
    logInfo(`▸ ${chalk.yellow(branch.name)} (${operation})`);
  });
  logNewline();

  if (!args.dryRun) {
    await submitBranches({
      branchesToSubmit: branchesToSubmit,
      cliAuthToken: cliAuthToken,
      repoOwner: repoOwner,
      repoName: repoName,
      editPRFieldsInline: args.editPRFieldsInline,
      createNewPRsAsDraft: args.createNewPRsAsDraft,
    });
  }
}

function getBranchesToSubmit(args: {
  currentBranch: Branch;
  scope: TSubmitScope;
}): Branch[] {
  let branches: Branch[] = [];

  switch (args.scope) {
    case "DOWNSTACK":
      branches = new MetaStackBuilder()
        .downstackFromBranch(args.currentBranch)
        .branches();
      break;
    case "FULLSTACK":
      branches = new MetaStackBuilder()
        .fullStackFromBranch(args.currentBranch)
        .branches();
      break;
    case "UPSTACK":
      branches = new MetaStackBuilder()
        .upstackInclusiveFromBranchWithParents(args.currentBranch)
        .branches();
      break;
    case "BRANCH":
      branches = [args.currentBranch];
      break;
    default:
      assertUnreachable(args.scope);
      branches = [];
  }

  return branches
    .filter((b) => !b.isTrunk())
    .filter((b) => b.getPRInfo()?.state !== "MERGED");
}

type TPRSubmissionInfo = t.UnwrapSchemaMap<
  typeof graphiteCLIRoutes.submitPullRequests.params
>["prs"];
type TPRSubmissionInfoWithBranch = (Unpacked<TPRSubmissionInfo> & {
  branch: Branch;
})[];

export async function submitBranches(args: {
  branchesToSubmit: Branch[];
  cliAuthToken: string;
  repoOwner: string;
  repoName: string;
  editPRFieldsInline: boolean;
  createNewPRsAsDraft: boolean | undefined;
}): Promise<void> {
  const submissionInfoWithBranches: TPRSubmissionInfoWithBranch =
    await getPRInfoForBranches({
      branches: args.branchesToSubmit,
      cliAuthToken: args.cliAuthToken,
      repoOwner: args.repoOwner,
      repoName: args.repoName,
      editPRFieldsInline: args.editPRFieldsInline,
      createNewPRsAsDraft: args.createNewPRsAsDraft,
    });

  const branchesPushedToRemote = pushBranchesToRemote(
    submissionInfoWithBranches.map((info) => info.branch)
  );

  // Filter out PRs which don't actually need a new submission (i.e. they
  // had no local code changes and their local base did not change).
  const submissionInfo: TPRSubmissionInfo = submissionInfoWithBranches.filter(
    (info) => {
      const prInfo = info.branch.getPRInfo();
      if (prInfo === undefined) {
        return true;
      }
      return shouldUpdatePR({
        branch: info.branch,
        previousBranchPRInfo: prInfo,
        branchesPushedToRemote: branchesPushedToRemote,
      });
    }
  );

  const prInfo = await submitPRsForBranches({
    submissionInfo: submissionInfo,
    branchesPushedToRemote: branchesPushedToRemote,
    cliAuthToken: args.cliAuthToken,
    repoOwner: args.repoOwner,
    repoName: args.repoName,
    editPRFieldsInline: args.editPRFieldsInline,
    createNewPRsAsDraft: args.createNewPRsAsDraft,
  });

  saveBranchPRInfo(prInfo);
  printSubmittedPRInfo(prInfo);
}

async function getPRInfoForBranches(args: {
  branches: Branch[];
  cliAuthToken: string;
  repoOwner: string;
  repoName: string;
  editPRFieldsInline: boolean;
  createNewPRsAsDraft: boolean | undefined;
}): Promise<TPRSubmissionInfoWithBranch> {
  const branchPRInfo: TPRSubmissionInfoWithBranch = [];
  for (const branch of args.branches) {
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
        branch: branch,
      });
    } else {
      branchPRInfo.push({
        action: "update",
        head: branch.name,
        base: parentBranchName,
        prNumber: previousPRInfo.number,
        branch: branch,
      });
    }
  }

  return branchPRInfo;
}

function pushBranchesToRemote(branches: Branch[]): Branch[] {
  const branchesPushedToRemote: Branch[] = [];

  // Two spaces between the text and icon is intentional for spacing purposes.
  logInfo(chalk.blueBright("➡️  [3/4] Pushing branches to remote..."));

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

async function submitPRsForBranches(args: {
  submissionInfo: TPRSubmissionInfo;
  branchesPushedToRemote: Branch[];
  cliAuthToken: string;
  repoOwner: string;
  repoName: string;
  editPRFieldsInline: boolean;
  createNewPRsAsDraft: boolean | undefined;
}): Promise<TSubmittedPR[]> {
  const submissionInfo = args.submissionInfo;
  if (submissionInfo.length === 0) {
    return [];
  }

  try {
    logInfo(
      chalk.blueBright(
        `📂 [4/4] Opening/updating PRs on GitHub for pushed branches...`
      )
    );

    const response = await request.requestWithArgs(
      API_SERVER,
      graphiteCLIRoutes.submitPullRequests,
      {
        authToken: args.cliAuthToken,
        repoOwner: args.repoOwner,
        repoName: args.repoName,
        prs: submissionInfo,
      }
    );

    if (response._response.status === 200 && response._response.body !== null) {
      const requests: { [head: string]: TSubmittedPRRequest } = {};
      submissionInfo.forEach((prRequest) => {
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
  const parent = branch.getParentFromMeta();
  if (parent === undefined) {
    throw new PreconditionsFailedError(
      `Could not find parent for branch ${branch.name} to submit PR against. Please checkout ${branch.name} and run \`gt upstack onto <parent_branch>\` to set its parent.`
    );
  }
  return parent.name;
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
    `Enter info for new pull request for ${chalk.yellow(args.branch.name)} ▸ ${
      args.parentBranchName
    }:`
  );

  const title = await getPRTitle({
    branch: args.branch,
    editPRFieldsInline: args.editPRFieldsInline,
  });
  args.branch.setPriorSubmitTitle(title);

  const body = await getPRBody({
    branch: args.branch,
    editPRFieldsInline: args.editPRFieldsInline,
  });
  args.branch.setPriorSubmitBody(body);

  const createAsDraft = await getPRDraftStatus({
    createNewPRsAsDraft: args.createNewPRsAsDraft,
  });

  // Log newline at the end to create some visual separation to the next
  // interactive PR section or status output.
  logNewline();

  return {
    title: title,
    body: body,
    draft: createAsDraft,
  };
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
