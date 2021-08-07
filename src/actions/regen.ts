import chalk from "chalk";
import { repoConfig } from "../lib/config";
import { log } from "../lib/log";
import { currentBranchPrecondition } from "../lib/preconditions";
import { gpExecSync } from "../lib/utils";
import { getTrunk } from "../lib/utils/trunk";
import Branch from "../wrapper-classes/branch";

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
