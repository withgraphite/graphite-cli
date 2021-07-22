import { execSync } from "child_process";
import yargs from "yargs";
import { log } from "../../lib/log";
import { checkoutBranch, logWarn } from "../../lib/utils";
import Branch from "../../wrapper-classes/branch";
import AbstractCommand from "../abstract_command";
import FixCommand from "../fix";
import RestackCommand from "../restack";

const args = {
  trunk: {
    type: "string",
    describe: "The name of your trunk branch that stacks get merged into.",
    required: true,
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

export default class SyncCommand extends AbstractCommand<typeof args> {
  static args = args;
  public async _execute(argv: argsT): Promise<void> {
    await sync(argv);
  }
}

async function sync(opts: argsT) {
  const oldBranch = Branch.getCurrentBranch();
  if (oldBranch === null) {
    logWarn("Not currently on a branch; no stack to sync.");
    return;
  }

  const oldBranchName = oldBranch.name;
  checkoutBranch(opts.trunk);
  const trunkChildren: Branch[] = await new Branch(
    opts.trunk
  ).getChildrenFromMeta();
  do {
    const branch = trunkChildren.pop()!;
    const children = await branch.getChildrenFromMeta();
    if (!shouldDeleteBranch(branch.name, opts.trunk)) {
      continue;
    }
    for (const child of children) {
      execSync(`git checkout -q ${child.name}`);
      await new RestackCommand().executeUnprofiled({
        onto: opts.trunk,
        silent: true,
      });
      trunkChildren.push(child);
    }
    checkoutBranch(opts.trunk);
    log(`Deleting ${branch.name}`, opts);
    deleteBranch(branch.name);
    await new FixCommand().executeUnprofiled({ silent: true });
  } while (trunkChildren.length > 0);
  checkoutBranch(oldBranchName);
}

function shouldDeleteBranch(branchName: string, trunk: string): boolean {
  const cherryCheckProvesMerged = execSync(
    `mergeBase=$(git merge-base ${trunk} ${branchName}) && git cherry ${trunk} $(git commit-tree $(git rev-parse "${branchName}^{tree}") -p $mergeBase -m _)`
  )
    .toString()
    .trim()
    .startsWith("-");
  if (cherryCheckProvesMerged) {
    return true;
  }
  const diffCheckProvesMerged =
    execSync(`git diff ${branchName} ${trunk}`).toString().trim().length == 0;
  if (diffCheckProvesMerged) {
    return true;
  }
  return false;
}

function deleteBranch(branchName: string) {
  execSync(`git branch -D ${branchName}`);
}
