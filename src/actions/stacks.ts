import chalk from "chalk";
import prompts from "prompts";
import { repoConfig } from "../lib/config";
import { ExitCancelledError, ExitFailedError } from "../lib/errors";
import { getTrunk, gpExecSync } from "../lib/utils";
import Branch from "../wrapper-classes/branch";

type TBranchWithMetadata = {
  branch: Branch;
  status: "TRACKED" | "NEEDS_RESTACK" | "NEEDS_REGEN";
};

export async function stacksAction(opts: {
  all: boolean;
  interactive: boolean;
}): Promise<void> {
  const { rootBranches, precomputedChildren } = await computeBranchLineage();
  const trunk = getTrunk();
  const current = Branch.getCurrentBranch();
  let choices: promptOptionT[] = [];

  for (const branch of rootBranches) {
    choices = choices.concat(
      await computeChoices(
        branch,
        precomputedChildren,
        trunk,
        current,
        opts.all
      )
    );
  }

  if (opts.interactive) {
    await promptBranches(choices);
  } else {
    choices.forEach((choice) => {
      console.log(choice.title);
    });
    return;
  }
}

async function computeBranchLineage(): Promise<{
  rootBranches: TBranchWithMetadata[];
  precomputedChildren: Record<string, TBranchWithMetadata[]>;
}> {
  const precomputedChildren: Record<string, TBranchWithMetadata[]> = {};
  const rootBranches: TBranchWithMetadata[] = [];
  const visitedBranches = {};

  // Compute lineage of stacks off of trunk.
  computeLineage({
    branch: getTrunk().useMemoizedResults(),
    children: precomputedChildren,
    rootBranches: rootBranches,
    visitedBranches: visitedBranches,
  });

  // Compute lineage of the remaining stacks in our search space - up to
  // maxStacksShowBehindTrunk whose bases were updated more recently than
  // maxDaysShownBehindTrunk.
  const branchesWithoutParents = await Branch.getAllBranchesWithoutParents({
    useMemoizedResults: true,
    maxDaysBehindTrunk: repoConfig.getMaxDaysShownBehindTrunk(),
    maxBranches: repoConfig.getMaxStacksShownBehindTrunk(),
    excludeTrunk: true,
  });
  branchesWithoutParents.forEach((branch) => {
    computeLineage({
      branch: branch,
      children: precomputedChildren,
      rootBranches: rootBranches,
      visitedBranches: visitedBranches,
    });
  });

  return { rootBranches, precomputedChildren };
}

function computeLineage(args: {
  branch: Branch;
  children: Record<string, TBranchWithMetadata[]>;
  rootBranches: TBranchWithMetadata[];
  visitedBranches: Record<string, boolean>;
}): void {
  const branch = args.branch;
  const children: Record<string, TBranchWithMetadata[]> = args.children;
  const rootBranches: TBranchWithMetadata[] = args.rootBranches;
  const visitedBranches = args.visitedBranches;

  if (visitedBranches[branch.name]) {
    return;
  } else {
    visitedBranches[branch.name] = true;
    children[branch.name] = [];
  }

  const parent = branch.getParentFromMeta();
  if (!parent) {
    rootBranches.push({
      branch,
      status: branch.getParentsFromGit().length > 0 ? "NEEDS_REGEN" : "TRACKED",
    });
  } else {
    children[parent.name].push({
      branch,
      status: branch.getParentsFromGit().some((gitParent) => {
        return gitParent.name === parent.name;
      })
        ? "TRACKED"
        : "NEEDS_RESTACK",
    });
  }

  branch.getChildrenFromGit().forEach((child) => {
    computeLineage({
      branch: child,
      children: children,
      rootBranches: rootBranches,
      visitedBranches: visitedBranches,
    });
  });
}

type promptOptionT = { title: string; value: string };

async function computeChoices(
  branch: TBranchWithMetadata,
  precomputedChildren: Record<string, TBranchWithMetadata[]>,
  trunk: Branch,
  current: Branch | null,
  showAll: boolean,
  indent = 0
): Promise<promptOptionT[]> {
  const children =
    branch.branch.name in precomputedChildren
      ? precomputedChildren[branch.branch.name]
      : [];

  if (
    indent === 0 &&
    children.length === 0 &&
    branch.branch.name !== trunk.name &&
    !(current && branch.branch.name === current.name) &&
    !showAll
  ) {
    return [];
  }

  let choices: promptOptionT[] = [];
  choices.push({
    value: branch.branch.name,
    title: `${"  ".repeat(indent)}${chalk.gray("↳")} ${
      current && branch.branch.name === current.name
        ? chalk.cyan(branch.branch.name)
        : chalk.blueBright(branch.branch.name)
    } (${
      current && branch.branch.name === current.name
        ? `${chalk.cyan("current")}, `
        : ""
    }${indent > 0 ? `${indent} deep` : "root"}${
      {
        TRACKED: "",
        NEEDS_RESTACK: `, ${chalk.yellow("`stack fix` required")}`,
        NEEDS_REGEN: `, ${chalk.yellow("untracked")}`,
      }[branch.status]
    })`,
  });

  for (const child of children) {
    choices = choices.concat(
      await computeChoices(
        child,
        precomputedChildren,
        trunk,
        current,
        showAll,
        indent + 1
      )
    );
  }
  return choices;
}

async function promptBranches(choices: promptOptionT[]): Promise<void> {
  const currentBranch = Branch.getCurrentBranch();
  let currentBranchIndex: undefined | number = undefined;

  if (currentBranch) {
    currentBranchIndex = choices
      .map((c) => c.value)
      .indexOf(currentBranch.name);
  }

  const chosenBranch = (
    await prompts({
      type: "select",
      name: "branch",
      message: `Checkout a branch`,
      choices: choices,
      ...(currentBranchIndex ? { initial: currentBranchIndex } : {}),
    })
  ).branch;

  if (!chosenBranch) {
    throw new ExitCancelledError("No branch selected");
  }

  if (chosenBranch && chosenBranch !== currentBranch?.name) {
    gpExecSync({ command: `git checkout ${chosenBranch}` }, (err) => {
      throw new ExitFailedError(`Failed to checkout ${chosenBranch}: ${err}`);
    });
  }
}
