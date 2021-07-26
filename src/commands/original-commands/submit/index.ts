import chalk from "chalk";
import fetch from "node-fetch";
import yargs from "yargs";
import { validate } from "../../../actions/validate";
import AbstractCommand from "../../../lib/abstract_command";
import { gpExecSync, logInternalErrorAndExit } from "../../../lib/utils";
import Branch from "../../../wrapper-classes/branch";
import {
  logError,
  logErrorAndExit,
  logInfo,
  logNewline,
  logSuccess,
  repoConfig,
  userConfig,
} from "../../lib/utils";
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
export default class SubmitCommand extends AbstractCommand<typeof args> {
  static args = args;
  public async _execute(argv: argsT): Promise<void> {
    const cliAuthToken = userConfig.authToken;
    if (!cliAuthToken || cliAuthToken.length === 0) {
      logErrorAndExit(
        "Please authenticate the Graphite CLI by visiting https://app.graphite.dev/activate."
      );
    }

    const repoName = repoConfig.repoName;
    const repoOwner = repoConfig.owner;
    if (repoName === undefined || repoOwner === undefined) {
      logErrorAndExit(
        "Could not infer repoName and/or repo owner. Please fill out these fields in your repo's copy of .graphite_repo_config."
      );
    }

    try {
      await validate("FULLSTACK", true);
    } catch {
      await new PrintStacksCommand().executeUnprofiled(argv);
      throw new Error(`Validation failed before submitting.`);
    }

    let currentBranch: Branch | undefined | null = Branch.getCurrentBranch();

    const stackOfBranches: Branch[] = [];
    while (
      currentBranch != null &&
      currentBranch != undefined &&
      currentBranch.getParentFromMeta() != undefined // dont put up pr for a base branch like "main"
    ) {
      stackOfBranches.push(currentBranch);

      const parentBranchName: string | undefined =
        currentBranch.getParentFromMeta()?.name;
      currentBranch =
        parentBranchName !== undefined
          ? await Branch.branchWithName(parentBranchName)
          : undefined;
    }

    // Create PR's for oldest branches first.
    stackOfBranches.reverse();

    const branchPRInfo: (
      | {
          action: "create";
          head: string;
          base: string;
          title: string;
        }
      | {
          action: "update";
          head: string;
          base: string;
          prNumber: number;
        }
    )[] = [];

    logInfo("Pushing branches to remote...");
    logNewline();

    stackOfBranches.forEach((branch, i) => {
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

      const parentBranchName = branch.getParentFromMeta()?.name;

      // This should never happen - above, we should've verified that we aren't
      // pushing the trunk branch and thus that every branch we're creating a PR
      // for has a valid parent branch.
      if (parentBranchName === undefined) {
        logInternalErrorAndExit(
          `Failed to find base branch for ${branch.name}. Aborting...`
        );
      }

      branchPRInfo.push({
        action: "create",
        head: branch.name,
        base: parentBranchName,
        title: `Merge ${branch.name} into ${parentBranchName}`,
      });
    });

    try {
      await fetch("https://api.graphite.dev/v1/graphite/submit/pull-requests", {
        method: "POST",
        body: JSON.stringify({
          authToken: cliAuthToken,
          repoOwner: repoOwner,
          repoName: repoName,
          prs: branchPRInfo,
        }),
        headers: {
          "Content-Type": "text/plain",
        },
      }).then((response) => {
        if (response.status === 200 && response.body !== null) {
          logInfo("Submitting PRs...");
          logNewline();

          response.json().then((body) => {
            body.prs.forEach(
              (
                pr:
                  | {
                      head: string;
                      prNumber: number;
                      prURL: string;
                      status: "updated" | "created";
                    }
                  | {
                      head: string;
                      error: string;
                      status: "error";
                    }
              ) => {
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
              }
            );
          });
        } else {
          logErrorAndExit("Failed to submit commits. Please try again.");
        }
      });
    } catch (error) {
      logErrorAndExit("Failed to submit commits. Please try again.");
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  assertUnreachable(arg: never) {}
}
