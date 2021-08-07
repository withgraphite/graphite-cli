import chalk from "chalk";
import prompts from "prompts";
import yargs from "yargs";
import { ExitCancelledError, ExitFailedError } from "../lib/errors";
import { profile } from "../lib/telemetry";
import { getTrunk, gpExecSync } from "../lib/utils";
import Branch from "../wrapper-classes/branch";

const args = {
  all: {
    describe: `Show all branches`,
    demandOption: false,
    default: false,
    type: "boolean",
    alias: "a",
  },
  interactive: {
    describe: `Interactively checkout a different stacked branch`,
    demandOption: false,
    default: true,
    type: "boolean",
    alias: "i",
  },
} as const;
type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;

export const command = "stacks";
export const description = "Print stacks";
export const builder = args;

type TBranchWithMetadata = {
  branch: Branch;
  status: "TRACKED" | "NEEDS_RESTACK" | "NEEDS_REGEN";
};

function computeBranchLineage() {
  const precomputedChildren: Record<string, TBranchWithMetadata[]> = {};
  const rootBranches: TBranchWithMetadata[] = [];
  Branch.allBranches().forEach((branch) => {
    const parent = branch.getParentFromMeta();
    if (!parent) {
      rootBranches.push({
        branch,
        status:
          branch.getParentsFromGit().length > 0 ? "NEEDS_REGEN" : "TRACKED",
      });
    } else {
      if (!(parent.name in precomputedChildren)) {
        precomputedChildren[parent.name] = [];
      }

      precomputedChildren[parent.name].push({
        branch,
        status: branch.getParentsFromGit().some((gitParent) => {
          return gitParent.name === parent.name;
        })
          ? "TRACKED"
          : "NEEDS_RESTACK",
      });
    }
  });
  return { rootBranches, precomputedChildren };
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

async function promptBranchesAndChildren(
  all: boolean,
  interactive: boolean
): Promise<void> {
  const { rootBranches, precomputedChildren } = computeBranchLineage();
  const trunk = getTrunk();
  const current = Branch.getCurrentBranch();
  let choices: promptOptionT[] = [];

  for (const branch of rootBranches) {
    choices = choices.concat(
      await computeChoices(branch, precomputedChildren, trunk, current, all)
    );
  }

  if (interactive) {
    await promptBranches(choices);
  } else {
    choices.forEach((choice) => {
      console.log(choice.title);
    });
    return;
  }
}

export const handler = async (args: argsT): Promise<void> => {
  return profile(args, async () => {
    await promptBranchesAndChildren(args.all, args.interactive);
  });
};
