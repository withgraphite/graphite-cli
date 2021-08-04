import yargs from "yargs";
import { createBranchAction } from "../../actions/create_branch";
import { profile } from "../../lib/telemetry";

const args = {
  name: {
    type: "string",
    positional: true,
    demandOption: false,
    optional: true,
    describe: "The name of the new branch",
  },
  silent: {
    describe: `silence output from the command`,
    demandOption: false,
    default: false,
    type: "boolean",
    alias: "s",
  },
  "commit-message": {
    describe: `commit staged changes on the new branch with this message`,
    demandOption: false,
    type: "string",
    alias: "m",
  },
  verify: {
    describe: `Run commit hooks`,
    demandOption: false,
    default: true,
    type: "boolean",
  },
} as const;
type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;

export const command = "create [name]";
export const description =
  "Creates a new branch stacked off of the current branch and commit staged changes. If no branch name is specified but a commit message is passed, create a branch name from the message.";
export const builder = args;
export const handler = async (argv: argsT): Promise<void> => {
  return profile(argv, async () => {
    await createBranchAction({
      silent: argv.silent,
      branchName: argv.name,
      noVerify: !argv.verify,
      commitMessage: argv["commit-message"],
    });
  });
};
