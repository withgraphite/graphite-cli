import chalk from "chalk";
import yargs from "yargs";
import { log } from "../../lib/log";
import Branch from "../../wrapper-classes/branch";
import AbstractCommand from "../abstract_command";

const args = {
  silent: {
    describe: `silence output from the command`,
    demandOption: false,
    default: false,
    type: "boolean",
    alias: "s",
  },
} as const;
type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;
export default class FixCommand extends AbstractCommand<typeof args> {
  static args = args;
  public async _execute(argv: argsT): Promise<void> {
    const branch = Branch.getCurrentBranch();

    printBranchNameStack(
      `(Original git derived stack)`,
      branch.stackByTracingGitParents(),
      argv
    );
    printBranchNameStack(
      `(Original meta derived stack)`,
      branch.stackByTracingMetaParents(),
      argv
    );

    // Walk the current branch down to the base and create stacks.
    await recursiveFix(branch, argv);

    printBranchNameStack(
      `(New meta stack)`,
      branch.stackByTracingMetaParents(),
      argv
    );
  }
}

function printBranchNameStack(message: string, names: string[], opts: argsT) {
  log(
    `[${names.map((name) => `(${chalk.green(name)})`).join("->")}] ${message}`,
    opts
  );
}

function recursiveFix(branch: Branch, opts: argsT) {
  const gitChildren = branch.getChildrenFromGit();
  // Check if we're at a base branch
  gitChildren.forEach((child) => {
    const oldMetaParent = child.getParentFromMeta();
    if (!oldMetaParent || oldMetaParent.name !== branch.name) {
      log(
        `Updating (${child.name}) meta parent from (${
          oldMetaParent?.name
        }) to (${chalk.green(branch.name)})`,
        opts
      ),
        child.setParentBranchName(branch.name);
    }
    recursiveFix(child, opts);
  });
}
