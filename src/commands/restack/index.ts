import chalk from "chalk";
import { execSync } from "child_process";
import yargs from "yargs";
import { log } from "../../lib/log";
import Branch from "../../wrapper-classes/branch";
import AbstractCommand from "../abstract_command";
import PrintStacksCommand from "../print-stacks";
import ValidateCommand from "../validate";

const args = {
  silent: {
    describe: `silence output from the command`,
    demandOption: false,
    default: false,
    type: "boolean",
    alias: "s",
  },
  onto: {
    describe: `A branch to restack the current stack onto`,
    demandOption: false,
    optional: true,
    type: "string",
  },
} as const;
type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;

function checkBranchCanBeMoved(branch: Branch, opts: argsT) {
  const gitParents = branch.getParentsFromGit();
  if (!gitParents || gitParents.length === 0) {
    log(
      chalk.red(
        `Cannot restack (${branch.name}) onto ${opts.onto}, (${branch.name}) appears to be a trunk branch.`
      ),
      opts
    );
    process.exit(1);
  }
}
export default class RestackCommand extends AbstractCommand<typeof args> {
  static args = args;
  public async _execute(argv: argsT): Promise<void> {
    await validateBeforeRestack(argv);

    log(`Before restack:`, argv);
    !argv.silent && (await new PrintStacksCommand().executeUnprofiled(args));

    const curBranch = await Branch.getCurrentBranch();
    if (argv.onto) {
      // Check that the current branch has a parent to prevent moving main
      checkBranchCanBeMoved(curBranch, argv);

      // Check that onto is a real branch
      const ontoBranch = await Branch.branchWithName(argv.onto);

      // set current branch's parent
      curBranch.setParentBranchName(ontoBranch.name);
      const gitParents = curBranch.getParentsFromGit();
      if (!gitParents || gitParents.length !== 1) {
        log(
          chalk.red(
            `Cannot restack onto, (${curBranch.name}) does not have a single git parent branch`
          ),
          argv
        );
        process.exit(1);
      }
      const gitParent = gitParents[0];
      execSync(
        `git rebase --onto ${ontoBranch.name} $(git merge-base ${curBranch.name} ${gitParent.name}) -Xtheirs`,
        { stdio: "ignore" }
      );

      // Now perform a restack starting from the onto branch:
      execSync(
        `git checkout ${ontoBranch.name}`,
        argv.silent ? { stdio: "ignore" } : {}
      );
      await restackBranch(ontoBranch, ontoBranch.name, argv);
      execSync(
        `git checkout ${curBranch.name}`,
        argv.silent ? { stdio: "ignore" } : {}
      );
    } else {
      await restackBranch(curBranch, curBranch.name, argv);
    }

    log(`After restack:`, argv);
    !argv.silent && (await new PrintStacksCommand().executeUnprofiled(args));
  }
}

async function validateBeforeRestack(opts: argsT) {
  try {
    await new ValidateCommand().executeUnprofiled({ silent: true });
  } catch (err) {
    throw new Error(`Cannot restack, the current graph of git branches does not match sd's meta dag. Please rebase your git branches or call "sd fix" to regenerate sd's meta dag.`)
  }
}

export async function restackBranch(
  currentBranch: Branch,
  // Pass the ref to the branch head _before_ it was rebased
  // We need this ref, because we can't find the child's merge base after the parent is rebased
  // Because rebasing duplicates commits, so there wont be a shared commit anymore.
  oldBranchHead: string,
  opts: argsT
): Promise<void> {
  const childBranches = await currentBranch.getChildrenFromMeta();
  if (!childBranches) {
    log(chalk.yellow(`Cannot restack, found no child branches`), opts);
    process.exit(1);
  }
  for (const childBranch of childBranches) {
    execSync(`git checkout ${childBranch.name}`, { stdio: "ignore" });
    const shaBeforeRebase = execSync(`git rev-parse ${childBranch.name}`)
      .toString()
      .trim();
    execSync(
      `git rebase --onto ${currentBranch.name} $(git merge-base ${childBranch.name} ${oldBranchHead}) -Xtheirs`,
      { stdio: "ignore" }
    );
    await restackBranch(childBranch, shaBeforeRebase, opts);
  }
  execSync(`git checkout ${currentBranch.name}`, { stdio: "ignore" });
}
