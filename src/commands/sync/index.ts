import { execSync } from "child_process";
import yargs from "yargs";
import { log } from "../../lib/log";
import Branch from "../../wrapper-classes/branch";
import AbstractCommand from "../abstract_command";
import FixCommand from "../fix";
import RestackCommand from "../restack";

const args = {
  "dry-run": {
    type: "boolean",
    default: false,
    describe: "List branches that would be deleted",
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
  const oldBranch = Branch.getCurrentBranch().name;
  execSync(`git checkout -q main`);
  const mainChildren: Branch[] = await new Branch("main").getChildrenFromMeta();
  do {
    const branch = mainChildren.pop()!;
    const children = await branch.getChildrenFromMeta();
    if (!shouldDeleteBranch(branch.name)) {
      continue;
    }
    for (const child of children) {
      execSync(`git checkout -q ${child.name}`);
      await new RestackCommand().executeUnprofiled({
        onto: "main",
        silent: true,
      });
      mainChildren.push(child);
    }
    execSync(`git checkout -q main`);
    log(`Deleting ${branch.name}`, opts);
    deleteBranch(branch.name);
    await new FixCommand().executeUnprofiled({ silent: true });
  } while (mainChildren.length > 0);
  execSync(`git checkout -q ${oldBranch}`);
}

function shouldDeleteBranch(branchName: string): boolean {
  const cherryCheckProvesMerged = execSync(
    `mergeBase=$(git merge-base main ${branchName}) && git cherry main $(git commit-tree $(git rev-parse "${branchName}^{tree}") -p $mergeBase -m _)`
  )
    .toString()
    .trim()
    .startsWith("-");
  if (cherryCheckProvesMerged) {
    return true;
  }
  const diffCheckProvesMerged =
    execSync(`git diff ${branchName} main`).toString().trim().length == 0;
  if (diffCheckProvesMerged) {
    return true;
  }
  return false;
}

function deleteBranch(branchName: string) {
  execSync(`git branch -D ${branchName}`);
}
