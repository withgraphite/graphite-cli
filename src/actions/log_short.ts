import chalk from "chalk";
import { ExitFailedError } from "../lib/errors";
import { currentBranchPrecondition } from "../lib/preconditions";
import { getTrunk, logTip } from "../lib/utils";
import { GitStackBuilder, Stack, StackNode } from "../wrapper-classes";
import Branch from "../wrapper-classes/branch";

function getStacks(): {
  fallenStacks: Stack[];
  untrackedStacks: Stack[];
  trunkStack: Stack;
} {
  const stacks = new GitStackBuilder({
    useMemoizedResults: true,
  }).allStacksFromTrunk();

  const trunkStack = stacks.find((s) => s.source.branch.isTrunk());
  if (!trunkStack) {
    throw new ExitFailedError(`Unable to find trunk stack`);
  }
  const fallenStacks: Stack[] = [];
  const untrackedStacks: Stack[] = [];

  stacks
    .filter((s) => !s.source.branch.isTrunk())
    .forEach((s) => {
      if (s.source.branch.getParentFromMeta()) {
        fallenStacks.push(s);
      } else {
        untrackedStacks.push(s);
      }
    });
  return { trunkStack, fallenStacks, untrackedStacks };
}

export async function logShortAction(): Promise<void> {
  const currentBranch = currentBranchPrecondition();
  const stacks = getStacks();

  const needsFix = printStackNode(stacks.trunkStack.source, {
    indent: 0,
    currentBranch: currentBranch,
  });

  stacks.fallenStacks.sort(sortStacksByAge).forEach((s) => {
    printStackNode(s.source, {
      indent: 0,
      currentBranch,
    });
  });

  if (needsFix || stacks.fallenStacks.length > 0) {
    logRebaseTip();
  }

  if (stacks.untrackedStacks.length > 0) {
    console.log("\nuntracked (created without Graphite)");
    stacks.untrackedStacks.sort(sortStacksByAge).forEach((s) =>
      printStackNode(s.source, {
        indent: 0,
        currentBranch,
      })
    );
    logRegenTip();
  }
}

function sortStacksByAge(a: Stack, b: Stack): number {
  return a.source.branch.lastCommitTime() > b.source.branch.lastCommitTime()
    ? -1
    : 1;
}

function printStackNode(
  node: StackNode,
  opts: { indent: number; currentBranch: Branch }
): { needsFix: boolean } {
  const metaParent = node.branch.getParentFromMeta();
  let needsFix: boolean =
    !!metaParent &&
    (!node.parent || metaParent.name !== node.parent.branch.name);
  console.log(
    [
      // indent
      `${"  ".repeat(opts.indent)}`,
      // branch name, potentially highlighted
      node.branch.name === opts.currentBranch.name
        ? chalk.cyan(`↳ ${node.branch.name}`)
        : `↳ ${node.branch.name}`,
      // whether it needs a rebase or not
      `${needsFix ? chalk.yellow(`(off ${metaParent?.name})`) : ""}`,
    ].join(" ")
  );
  node.children.forEach((c) => {
    needsFix =
      printStackNode(c, {
        indent: opts.indent + 1,
        currentBranch: opts.currentBranch,
      }).needsFix || needsFix;
  });
  return { needsFix };
}

function logRebaseTip(): void {
  logTip(
    [
      "Some branch merge-bases have fell behind their parent branch latest commit. Consider:",
      `> gt branch checkout ${getTrunk()} && gt stack fix --rebase # fix all stacks`,
      `> gt branch checkout <branch> && gt stack fix --rebase # fix a specific stack`,
      `> gt branch checkout <branch> && gt upstack onto <parent> # fix a stack and update the parent`,
    ].join("\n")
  );
}

function logRegenTip(): void {
  logTip(
    [
      "Graphite does not know the parent of untracked branches. Consider:",
      `> gt branch checkout <branch> && gt stack fix --regen # generate stack based on current commit tree`,
      `> gt branch checkout <branch> && gt upstack onto <parent> # fix a stack and update the parent`,
      `> gt repo ignored-branches --add <branch> # set branch to be ignored by Graphite`,
      `> git branch -D <branch> # delete branch from git`,
    ].join("\n")
  );
}
