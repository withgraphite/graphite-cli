import chalk from "chalk";
import prompts from "prompts";
import { repoConfig } from "../lib/config";
import { ExitFailedError, RebaseConflictError } from "../lib/errors";
import { log } from "../lib/log";
import {
  currentBranchPrecondition,
  uncommittedChangesPrecondition,
} from "../lib/preconditions";
import {
  checkoutBranch,
  gpExecSync,
  logInfo,
  rebaseInProgress,
} from "../lib/utils";
import { getTrunk } from "../lib/utils/trunk";
import {
  Branch,
  GitStackBuilder,
  MetaStackBuilder,
  Stack,
  stackNodeT,
} from "../wrapper-classes";

async function promptStacks(opts: {
  gitStack: Stack;
  metaStack: Stack;
}): Promise<"regen" | "rebase"> {
  const response = await prompts({
    type: "select",
    name: "value",
    message: `Pick a source of truth for stacks`,
    choices: ["rebase", "regen"].map((r) => {
      return {
        title:
          r === "rebase"
            ? "Graphite stacks\n" +
              opts.metaStack
                .toString()
                .split("\n")
                .map((l) => "    " + l)
                .join("\n") +
              "\n"
            : "Git commit tree\n" +
              opts.gitStack
                .toString()
                .split("\n")
                .map((l) => "    " + l)
                .join("\n") +
              "\n",
        value: r,
      };
    }),
  });

  return response.value;
}

export async function fixAction(opts: {
  action: "regen" | "rebase" | undefined;
  silent: boolean;
}): Promise<void> {
  const currentBranch = currentBranchPrecondition();
  uncommittedChangesPrecondition();

  const metaStack = new MetaStackBuilder().fullStackFromBranch(currentBranch);
  const gitStack = new GitStackBuilder().fullStackFromBranch(currentBranch);

  // Consider noop
  if (metaStack.equals(gitStack)) {
    logInfo(`No fix needed`);
    return;
  }

  const action = opts.action || (await promptStacks({ gitStack, metaStack }));

  if (action === "regen") {
    await regenAction(opts.silent);
  } else {
    for (const child of metaStack.source.children) {
      await restackNode(child, opts.silent);
    }
  }
  checkoutBranch(currentBranch.name);
}

export async function restackBranch(
  branch: Branch,
  silent: boolean
): Promise<void> {
  const metaStack =
    new MetaStackBuilder().upstackInclusiveFromBranchWithParents(branch);
  await restackNode(metaStack.source, silent);
}

async function restackNode(node: stackNodeT, silent: boolean): Promise<void> {
  if (rebaseInProgress()) {
    throw new RebaseConflictError(
      `Interactive rebase in progress, cannot fix (${node.branch.name}). Complete the rebase and re-run fix command.`
    );
  }
  const parentBranch = node.parents[0].branch;
  if (!parentBranch) {
    throw new ExitFailedError(
      `Cannot find parent in stack for (${node.branch.name}), stopping fix`
    );
  }
  const mergeBase = node.branch.getMetaMergeBase();
  if (!mergeBase) {
    throw new ExitFailedError(
      `Cannot find a merge base in the stack for (${node.branch.name}), stopping fix`
    );
  }

  if (parentBranch.ref() === mergeBase) {
    logInfo(
      `No fix needed for (${node.branch.name}) on (${parentBranch.name})`
    );
  } else {
    logInfo(
      `Fixing (${chalk.green(node.branch.name)}) on (${parentBranch.name})`
    );
    checkoutBranch(node.branch.name);
    node.branch.setMetaPrevRef(node.branch.getCurrentRef());
    gpExecSync(
      {
        command: `git rebase --onto ${parentBranch.name} ${mergeBase} ${node.branch.name}`,
        options: { stdio: "ignore" },
      },
      () => {
        if (rebaseInProgress()) {
          throw new RebaseConflictError(
            "Resolve the conflict (via `git rebase --continue`) and then rerun `gp stack fix` to fix the remaining stack."
          );
        }
      }
    );
  }

  for (const child of node.children) {
    await restackNode(child, silent);
  }
}

export async function regenAction(silent: boolean): Promise<void> {
  const branch = currentBranchPrecondition();
  const trunk = getTrunk();
  if (trunk.name == branch.name) {
    // special case regen all stacks
    regenAllStacks(silent);
    return;
  }

  const baseBranch = getStackBaseBranch(branch);
  await recursiveRegen(baseBranch, trunk, silent);
}

function regenAllStacks(silent: boolean): void {
  const allBranches = Branch.allBranches();
  log(`Computing stacks from ${allBranches.length} branches...`);
  const allStackBaseNames = allBranches
    .filter(
      (b) =>
        !repoConfig.getIgnoreBranches().includes(b.name) &&
        b.name != getTrunk().name
    )
    .map((b) => getStackBaseBranch(b).name);
  const uniqueStackBaseNames = [...new Set(allStackBaseNames)];
  uniqueStackBaseNames.forEach((branchName) => {
    log(`Regenerating stack for (${branchName})`);
    recursiveRegen(new Branch(branchName), getTrunk(), silent);
  });
}

// Returns the first non-trunk base branch. If there is no non-trunk branch
// - the current branch is trunk - we return null.
function getStackBaseBranch(currentBranch: Branch): Branch {
  const trunkMergeBase = gpExecSync({
    command: `git merge-base ${getTrunk()} ${currentBranch.name}`,
  })
    .toString()
    .trim();

  let baseBranch: Branch = currentBranch;
  let baseBranchParent = baseBranch.getParentsFromGit()[0]; // TODO: greg - support two parents

  while (
    baseBranchParent !== undefined &&
    baseBranchParent.name !== getTrunk().name &&
    baseBranchParent.isUpstreamOf(trunkMergeBase)
  ) {
    baseBranch = baseBranchParent;
    baseBranchParent = baseBranch.getParentsFromGit()[0];
  }

  return baseBranch;
}

function recursiveRegen(
  currentBranch: Branch,
  newParent: Branch,
  silent: boolean
) {
  const oldMetaParent = currentBranch.getParentFromMeta();

  // The only time we expect newParent to be undefined is if we're fixing
  // the base branch which is behind trunk.
  if (oldMetaParent && oldMetaParent.name === newParent.name) {
    log(
      `-> No change for (${currentBranch.name}) with branch parent (${oldMetaParent.name})`,
      { silent }
    );
  } else {
    log(
      `-> Updating (${currentBranch.name}) branch parent from (${
        oldMetaParent?.name
      }) to (${chalk.green(newParent.name)})`,
      { silent }
    );
    currentBranch.setParentBranchName(newParent.name);
  }

  const gitChildren = currentBranch.getChildrenFromGit();
  gitChildren.forEach((child) => {
    recursiveRegen(child, currentBranch, silent);
  });
}
