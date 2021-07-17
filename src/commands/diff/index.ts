import { execSync } from "child_process";
import yargs from "yargs";
import { makeId, userConfig } from "../../lib/utils";
import Branch from "../../wrapper-classes/branch";
import AbstractCommand from "../abstract_command";

const args = {
  "branch-name": {
    type: "string",
    alias: "b",
    describe: "The name of the target which builds your app for release",
  },
  message: {
    type: "string",
    alias: "m",
    describe: "The message for the new commit",
  },
  silent: {
    describe: `silence output from the command`,
    demandOption: false,
    default: false,
    type: "boolean",
    alias: "s",
  },
} as const;
type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;

export default class DiffCommand extends AbstractCommand<typeof args> {
  static args = args;
  public async _execute(argv: argsT) {
    const parentBranch = Branch.getCurrentBranch();
    execSync(
      `git checkout -b "${
        argv["branch-name"] || `${userConfig.branchPrefix || ""}${makeId(6)}`
      }"`,
      argv.silent ? { stdio: "ignore" } : {}
    );
    execSync("git add --all");
    execSync(`git commit -m "${argv.message || "Updates"}"`);
    const currentBranch = Branch.getCurrentBranch();
    currentBranch.setParentBranchName(parentBranch.name);
  }
}
