import yargs from "yargs";
import { createBranchAction } from "../../actions/create_branch";
import { profile } from "../../lib/telemetry";

const args = {
  name: {
    type: "string",
    positional: true,
    demandOption: false,
    optional: true,
    describe: "The name of the new branch.",
  },
  "commit-message": {
    describe: `Commit staged changes on the new branch with this message.`,
    demandOption: false,
    type: "string",
    alias: "m",
  },
  "add-all": {
    describe: `Stage all un-staged changes on the new branch with this message.`,
    demandOption: false,
    default: false,
    type: "boolean",
    alias: "a",
  },
} as const;
type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;

export const aliases = ["c"];
export const command = "create [name]";
export const canonical = "branch create";
export const description =
  "Create a new branch stacked on top of the current branch and commit staged changes. If no branch name is specified but a commit message is passed, generate a branch name from the commit message.";
export const builder = args;
export const handler = async (argv: argsT): Promise<void> => {
  return profile(argv, canonical, async () => {
    await createBranchAction({
      branchName: argv.name,
      commitMessage: argv["commit-message"],
      addAll: argv["add-all"],
    });
  });
};
