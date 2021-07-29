import chalk from "chalk";
import { log } from "../lib/log";
import { logWarn } from "../lib/utils/splog";
import { getTrunk } from "../lib/utils/trunk";
import Branch from "../wrapper-classes/branch";

export async function regenAction(silent: boolean): Promise<void> {
  const branch = Branch.getCurrentBranch();
  if (branch === null) {
    logWarn(
      `No current branch. Please checkout a branch in the stack to use regen.`
    );
    return;
  }

  const trunk = getTrunk();
  const baseBranch = getStackBaseBranch(branch, trunk);
  if (baseBranch === null) {
    logWarn(`Current branch matches trunk (${getTrunk()}). No stack to regen.`);
    return;
  }

  printBranchNameStack(
    `(Original git infered stack)`,
    baseBranch.stackByTracingGitParents(),
    silent
  );
  printBranchNameStack(
    `(Original graphite recorded stack)`,
    baseBranch.stackByTracingMetaParents(),
    silent
  );

  // Walk the current branch down to the base and create stacks.
  const baseBranchParents = baseBranch.getParentsFromGit();
  // TODO (nicholasyan): this is a short-term band-aid. We need to handle
  // multiple parents in the long-term.
  await recursiveFix(baseBranch, baseBranchParents[0], silent);

  printBranchNameStack(
    `(New graphite stack)`,
    baseBranch.stackByTracingMetaParents(),
    silent
  );
}

// Returns the first non-trunk base branch. If there is no non-trunk branch
// - the current branch is trunk - we return null.
function getStackBaseBranch(
  currentBranch: Branch,
  trunk: Branch
): Branch | null {
  if (currentBranch === trunk) {
    return null;
  }

  let baseBranch: Branch = currentBranch;
  let baseBranchParent = baseBranch.getParentFromMeta();
  while (baseBranchParent !== undefined && baseBranchParent !== trunk) {
    baseBranch = baseBranchParent;
    baseBranchParent = baseBranch.getParentFromMeta();
  }

  return baseBranch;
}

function printBranchNameStack(
  message: string,
  names: string[],
  silent: boolean
) {
  log(
    `[${names.map((name) => `(${chalk.green(name)})`).join("->")}] ${message}`,
    { silent }
  );
}

function recursiveFix(
  currentBranch: Branch,
  newParent: Branch | undefined,
  silent: boolean
) {
  const oldMetaParent = currentBranch.getParentFromMeta();

  // The only time we expect newParent to be undefined is if we're fixing
  // the base branch which is behind trunk.
  if (newParent) {
    log(
      `Updating (${currentBranch.name}) branch parent from (${
        oldMetaParent?.name
      }) to (${chalk.green(newParent.name)})`,
      { silent }
    );
    currentBranch.setParentBranchName(newParent.name);
  }

  const gitChildren = currentBranch.getChildrenFromGit();
  gitChildren.forEach((child) => {
    recursiveFix(child, currentBranch, silent);
  });
}
