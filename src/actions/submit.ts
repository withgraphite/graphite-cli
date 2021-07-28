import graphiteCLIRoutes from "@screenplaydev/graphite-cli-routes";
import * as t from "@screenplaydev/retype";
import { request } from "@screenplaydev/retyped-routes";
import chalk from "chalk";
import PrintStacksCommand from "../commands/original-commands/print-stacks";
import { API_SERVER } from "../lib/api";
import {
  gpExecSync,
  logError,
  logErrorAndExit,
  logInfo,
  logInternalErrorAndExit,
  logNewline,
  logSuccess,
  logWarn,
  userConfig,
} from "../lib/utils";
import Branch from "../wrapper-classes/branch";
import { getRepoName, getRepoOwner } from "./repo_config";
import { validate } from "./validate";

type TSubmittedPRInfo = t.UnwrapSchemaMap<
  typeof graphiteCLIRoutes.submitPullRequests.response
>;
export async function submitAction(args: {}): Promise<void> {
  const cliAuthToken = getCLIAuthToken();
  const repoName = getRepoName();
  const repoOwner = getRepoOwner();

  try {
    await validate("FULLSTACK", true);
  } catch {
    await new PrintStacksCommand().executeUnprofiled({});
    throw new Error(`Validation failed before submitting.`);
  }

  const currentBranch: Branch | undefined | null = Branch.getCurrentBranch();
  if (currentBranch === undefined || currentBranch === null) {
    logWarn("No current stack to submit.");
    return;
  }

  const stackOfBranches = await getDownstackInclusive(currentBranch);
  if (stackOfBranches.length === 0) {
    logWarn("No downstack branches found.");
    return;
  }

  pushBranchesToRemote(stackOfBranches);

  const submittedPRInfo = await submitPRsForBranches({
    branches: stackOfBranches,
    cliAuthToken: cliAuthToken,
    repoOwner: repoOwner,
    repoName: repoName,
  });
  if (submittedPRInfo === null) {
    logErrorAndExit("Failed to submit commits. Please try again.");
  }

  printSubmittedPRInfo(submittedPRInfo.prs);
  saveBranchPRInfo(submittedPRInfo.prs);
}

function getCLIAuthToken(): string {
  const token = userConfig.authToken;
  if (!token || token.length === 0) {
    logErrorAndExit(
      "Please authenticate your Graphite CLI by visiting https://app.graphite.dev/activate."
    );
  }
  return token;
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
        logInternalErrorAndExit(
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
  args.branches.forEach((branch) => {
    // The branch here should always have a parent - above, the branches we've
    // gathered should exclude trunk which ensures that every branch we're submitting
    // a PR for has a valid parent.
    const parentBranchName = branch.getParentFromMeta()!.name;

    const prInfo = branch.getPRInfo();

    if (prInfo) {
      branchPRInfo.push({
        action: "update",
        head: branch.name,
        base: parentBranchName,
        prNumber: prInfo.number,
      });
    } else {
      branchPRInfo.push({
        action: "create",
        head: branch.name,
        base: parentBranchName,
        // Default placeholder title.
        // TODO (nicholasyan): improve this by using the commit message if the
        // branch only has 1 commit.
        title: `Merge ${branch.name} into ${parentBranchName}`,
      });
    }
  });

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

    if (response._response.status !== 200 || response._response.body === null) {
      return null;
    }

    return response;
  } catch (error) {
    return null;
  }
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
