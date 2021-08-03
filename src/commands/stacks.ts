import chalk from "chalk";
import yargs from "yargs";
import { profile } from "../lib/telemetry";
import { getTrunk } from "../lib/utils";
import Branch from "../wrapper-classes/branch";

const args = {
  all: {
    describe: `Show all branches`,
    demandOption: false,
    default: false,
    type: "boolean",
    alias: "a",
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

async function printBranchAndChildren(
  branch: TBranchWithMetadata,
  precomputedChildren: Record<string, TBranchWithMetadata[]>,
  trunk: Branch,
  current: Branch | null,
  showAll: boolean,
  indent = 0
): Promise<void> {
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
    return;
  }

  for (let i = 0; i < indent; i++) {
    process.stdout.write("  ");
  }

  console.log(
    `${chalk.gray("↳")} ${
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
    })`
  );

  for (const child of children) {
    await printBranchAndChildren(
      child,
      precomputedChildren,
      trunk,
      current,
      showAll,
      indent + 1
    );
  }
}

export const handler = async (args: argsT): Promise<void> => {
  return profile(args, async () => {
    const { rootBranches, precomputedChildren } = computeBranchLineage();
    const trunk = getTrunk();
    const current = Branch.getCurrentBranch();

    for (const branch of rootBranches) {
      await printBranchAndChildren(
        branch,
        precomputedChildren,
        trunk,
        current,
        args.all
      );
    }
  });
};
