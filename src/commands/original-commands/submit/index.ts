import graphiteCLIRoutes from "@screenplaydev/graphite-cli-routes";
import * as t from "@screenplaydev/retype";
import { request } from "@screenplaydev/retyped-routes";
import chalk from "chalk";
import yargs from "yargs";
import { validate } from "../../../actions/validate";
import AbstractCommand from "../../../lib/abstract_command";
import { API_SERVER } from "../../../lib/api";
import {
  gpExecSync,
  logError,
  logErrorAndExit,
  logInfo,
  logInternalErrorAndExit,
  logNewline,
  logSuccess,
  logWarn,
  repoConfig,
  userConfig,
} from "../../../lib/utils";
import Branch from "../../../wrapper-classes/branch";
import PrintStacksCommand from "../print-stacks";

const args = {
  silent: {
    describe: `silence output from the command`,
    demandOption: false,
    default: false,
    type: "boolean",
    alias: "s",
  },
  "from-commits": {
    describe: "The name of the target which builds your app for release",
    demandOption: false,
    type: "boolean",
    default: false,
  },
  fill: {
    describe: "Do not prompt for title/body and just use commit info",
    demandOption: false,
    type: "boolean",
    default: false,
    alias: "f",
  },
} as const;
type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;

type TSubmittedPRInfo = t.UnwrapSchemaMap<
  typeof graphiteCLIRoutes.submitPullRequests.response
>;

export default class SubmitCommand extends AbstractCommand<typeof args> {
  static args = args;
  public async _execute(argv: argsT): Promise<void> {
    const cliAuthToken = this.getCLIAuthToken();
    const { repoName, repoOwner } = this.getRepoNameAndOwner();

    try {
      await validate("FULLSTACK", true);
    } catch {
      await new PrintStacksCommand().executeUnprofiled(argv);
      throw new Error(`Validation failed before submitting.`);
    }

    let currentBranch: Branch | undefined | null = Branch.getCurrentBranch();
    if (currentBranch === undefined || currentBranch === null) {
      logWarn("No current stack to submit.");
      return;
    }

    const stackOfBranches = await this.getDownstackInclusive(currentBranch);

    this.pushBranchesToRemote(stackOfBranches);

    const submittedPRInfo = await this.submitPRsForBranches({
      branches: stackOfBranches,
      cliAuthToken: cliAuthToken,
      repoOwner: repoOwner,
      repoName: repoName,
    });
    if (submittedPRInfo === null) {
      logErrorAndExit("Failed to submit commits. Please try again.");
    }

    this.printSubmittedPRInfo(submittedPRInfo.prs);
  }

  getCLIAuthToken(): string {
    const token = userConfig.authToken;
    if (!token || token.length === 0) {
      logErrorAndExit(
        "Please authenticate your Graphite CLI by visiting https://app.graphite.dev/activate."
      );
    }
    return token;
  }

  getRepoNameAndOwner(): {
    repoName: string;
    repoOwner: string;
  } {
    const repoName = repoConfig.repoName;
    const repoOwner = repoConfig.owner;
    if (repoName === undefined || repoOwner === undefined) {
      logErrorAndExit(
        "Could not infer repoName and/or repo owner. Please fill out these fields in your repo's copy of .graphite_repo_config."
      );
    }
    return {
      repoName: repoName,
      repoOwner: repoOwner,
    };
  }

  async getDownstackInclusive(topOfStack: Branch): Promise<Branch[]> {
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

  pushBranchesToRemote(branches: Branch[]): void {
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

  async submitPRsForBranches(args: {
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

      branchPRInfo.push({
        action: "create",
        head: branch.name,
        base: parentBranchName,
        // Default placeholder title.
        // TODO (nicholasyan): improve this by using the commit message if the
        // branch only has 1 commit.
        title: `Merge ${branch.name} into ${parentBranchName}`,
      });
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

      if (
        response._response.status !== 200 ||
        response._response.body === null
      ) {
        return null;
      }

      return response._response.json();
    } catch (error) {
      return null;
    }
  }

  printSubmittedPRInfo(
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
          this.assertUnreachable(pr);
      }

      if ("error" in pr) {
        logError(pr.error);
      } else {
        console.log(`${pr.prURL} (${status})`);
      }

      logNewline();
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  assertUnreachable(arg: never): void {}
}
