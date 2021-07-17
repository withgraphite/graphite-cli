import chalk from "chalk";
import { execSync } from "child_process";
import yargs from "yargs";
import { log } from "../../lib/log";
import { CURRENT_REPO_CONFIG_PATH, trunkBranches } from "../../lib/utils";
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

function getParentForRebaseOnto(branch: Branch, argv: argsT): Branch {
  const parent = branch.getParentFromMeta();
  if (!parent) {
    log(
      chalk.red(
        `Cannot "restack --onto", (${branch.name}) has no parent as defined by the meta.`
      ),
      argv
    );
    process.exit(1);
  }
  return parent;
}

export default class RestackCommand extends AbstractCommand<typeof args> {
  static args = args;
  public async _execute(argv: argsT): Promise<void> {
    // Print state before
    log(`Before restack:`, argv);
    !argv.silent && (await new PrintStacksCommand().executeUnprofiled(args));

    const originalBranch = Branch.getCurrentBranch();
    if (argv.onto) {
      await restackOnto(originalBranch, argv.onto, argv);
    } else {
      await restackBranch(originalBranch, originalBranch.name, argv);
    }
    execSync(`git checkout -q ${originalBranch.name}`);

    // Print state after
    log(`After restack:`, argv);
    !argv.silent && (await new PrintStacksCommand().executeUnprofiled(args));
  }
}

function checkBranchCanBeMoved(branch: Branch, opts: argsT) {
  if (trunkBranches && branch.name in trunkBranches) {
    log(
      chalk.red(
        `Cannot restack (${branch.name}) onto ${opts.onto}, (${branch.name}) is listed in (${CURRENT_REPO_CONFIG_PATH}) as a trunk branch.`
      ),
      opts
    );
    process.exit(1);
  }
}

async function validate(argv: argsT) {
  try {
    await new ValidateCommand().executeUnprofiled({ silent: true });
  } catch {
    log(
      chalk.red(
        `Cannot "restack --onto", git derrived stack must match meta defined stack. Consider running "restack" or "fix" first.`
      ),
      argv
    );
    process.exit(1);
  }
}

async function restackOnto(currentBranch: Branch, onto: string, argv: argsT) {
  // Check that the current branch has a parent to prevent moving main
  checkBranchCanBeMoved(currentBranch, argv);
  await validate(argv);
  const parent = getParentForRebaseOnto(currentBranch, argv);
  execSync(
    `git rebase --onto ${onto} $(git merge-base ${currentBranch.name} ${parent.name}) ${currentBranch.name} -Xtheirs`,
    { stdio: "ignore" }
  );
  // set current branch's parent only if the rebase succeeds.
  currentBranch.setParentBranchName(onto);
  // Now perform a restack starting from the onto branch:
  await restackBranch(new Branch(onto), onto, argv);
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
    const shaBeforeRebase = execSync(`git rev-parse ${childBranch.name}`)
      .toString()
      .trim();
    console.log(
      `git rebase --onto ${currentBranch.name} $(git merge-base ${childBranch.name} ${oldBranchHead}) ${childBranch.name} -Xtheirs`
    );
    execSync(
      `git rebase --onto ${currentBranch.name} $(git merge-base ${childBranch.name} ${oldBranchHead}) ${childBranch.name} -Xtheirs`,
      { stdio: "ignore" }
    );
    await restackBranch(childBranch, shaBeforeRebase, opts);
  }
}
