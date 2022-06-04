import { default as chalk } from 'chalk';
import prompts from 'prompts';
import { TContext } from '../../lib/context';
import { KilledError } from '../../lib/errors';
import { deleteBranchAction, isSafeToDelete } from '../delete_branch';

/**
 * This method is assumed to be idempotent -- if a merge conflict interrupts
 * execution of this method, we simply restart the method upon running `gt
 * continue`.
 *
 * It returns a list of branches whose parents have changed so that we know
 * which branches to restack.
 */
// eslint-disable-next-line max-lines-per-function
export async function cleanBranches(
  opts: {
    showDeleteProgress: boolean;
    force: boolean;
  },
  context: TContext
): Promise<string[]> {
  /**
   * To find and delete all of the merged/closed branches, we traverse all of
   * the stacks off of trunk, greedily deleting the base branches and rebasing
   * the remaining branches.
   *
   * To greedily delete the branches, we keep track of the branches we plan
   * to delete as well as a live snapshot of their children. When a branch
   * we plan to delete has no more children, we know that it is safe to
   * eagerly delete.
   *
   * This eager deletion doesn't matter much in small repos, but matters
   * a lot if a repo has a lot of branches to delete. Whereas previously
   * any error in `repo sync` would throw away all of the work the command did
   * to determine what could and couldn't be deleted, now we take advantage
   * of that work as soon as we can.
   */

  const branchesToProcess = context.metaCache.getChildren(
    context.metaCache.trunk
  );
  const branchesToDelete: Record<string, Set<string>> = {};
  const branchesWithNewParents: string[] = [];

  /**
   * Since we're doing a DFS, assuming rather even distribution of stacks off
   * of trunk children, we can trace the progress of the DFS through the trunk
   * children to give the user a sense of how far the repo sync has progressed.
   * Note that we only do this if the user has a large number of branches off
   * of trunk (> 50).
   */
  const progressMarkers = opts.showDeleteProgress
    ? getProgressMarkers(branchesToProcess)
    : {};

  while (branchesToProcess.length > 0) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const branchName = branchesToProcess.pop()!;

    if (branchName in branchesToDelete) {
      continue;
    }

    if (branchName in progressMarkers) {
      context.splog.logInfo(
        `${progressMarkers[branchName]} done searching for merged/closed branches to delete...`
      );
    }

    context.splog.logDebug(`Checking if should delete ${branchName}...`);
    const shouldDelete = await shouldDeleteBranch(
      {
        branchName: branchName,
        force: opts.force,
      },
      context
    );
    if (shouldDelete) {
      const children = context.metaCache.getChildren(branchName);

      // We concat children here (because we pop above) to make our search a DFS.
      children.forEach((b) => branchesToProcess.push(b));

      // Value in branchesToDelete is a list of children blocking deletion.
      branchesToDelete[branchName] = new Set(children);
      context.splog.logDebug(
        `Marked ${branchName} for deletion. Blockers: ${children}`
      );
    } else {
      // We know this branch isn't being deleted.
      // If its parent IS being deleted, we have to change its parent.

      // First, find the nearest ancestor that isn't being deleted.
      const parentBranchName =
        context.metaCache.getParentPrecondition(branchName);
      let newParentBranchName = parentBranchName;
      while (newParentBranchName in branchesToDelete) {
        newParentBranchName =
          context.metaCache.getParentPrecondition(newParentBranchName);
      }

      // If the nearest ancestor is not already the parent, we make it so.
      if (newParentBranchName !== parentBranchName) {
        context.metaCache.setParent(branchName, newParentBranchName);
        context.splog.logInfo(
          `Set parent of ${chalk.cyan(branchName)} to ${chalk.blueBright(
            newParentBranchName
          )}.`
        );
        branchesWithNewParents.push(branchName);

        // This branch is no longer blocking its parent's deletion.
        branchesToDelete[parentBranchName].delete(branchName);
        context.splog.logDebug(
          `Removed a blocker for ${parentBranchName}. Blockers: ${[
            ...branchesToDelete[parentBranchName].entries(),
          ]}`
        );
      }
    }

    greedilyDeleteUnblockedBranches(branchesToDelete, context);
  }
  return branchesWithNewParents;
}

// With either path in the above, we may have unblocked a branch that can
// be deleted immediately. We repeatedly check for branches that can be
// deleted, because the act of deleting one branch may free up another.
function greedilyDeleteUnblockedBranches(
  branchesToDelete: Record<string, Set<string>>,
  context: TContext
) {
  const unblockedBranches = Object.keys(branchesToDelete).filter(
    (branchToDelete) => branchesToDelete[branchToDelete].size === 0
  );
  context.splog.logDebug(`Unblocked branches: ${unblockedBranches}`);

  while (unblockedBranches.length > 0) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const branchName = unblockedBranches.pop()!;
    const parentBranchName =
      context.metaCache.getParentPrecondition(branchName);

    deleteBranchAction({ branchName: branchName, force: true }, context);

    // This branch is no longer blocking its parent's deletion.
    // Remove it from the parents list of blockers and check if parent is
    // now unblocked for deletion.
    if (
      branchesToDelete[parentBranchName]?.delete(branchName) &&
      branchesToDelete[parentBranchName].size === 0
    ) {
      context.splog.logDebug(`${parentBranchName} is now unblocked.`);
      unblockedBranches.push(parentBranchName);
    }

    // Remove the branch from the list of branches to delete.
    delete branchesToDelete[branchName];
  }
}

function getProgressMarkers(trunkChildren: string[]): Record<string, string> {
  const progressMarkers: Record<string, string> = {};
  trunkChildren
    // Ignore the first child - don't show 0% progress.
    .slice(1)
    .forEach(
      (child, i) =>
        (progressMarkers[child] = `${+(
          // Add 1 to the overall children length to account for the fact that
          // when we're on the last trunk child, we're not 100% done - we need
          // to go through its stack.
          ((i + 1 / (trunkChildren.length + 1)) * 100).toFixed(2)
        )}%`)
    );
  return progressMarkers;
}

async function shouldDeleteBranch(
  args: {
    branchName: string;
    force: boolean;
  },
  context: TContext
): Promise<boolean> {
  const shouldDelete = isSafeToDelete(args.branchName, context);
  if (!shouldDelete.result) {
    return false;
  }

  if (args.force) {
    return true;
  }

  if (!context.interactive) {
    return false;
  }

  return (
    (
      await prompts(
        {
          type: 'confirm',
          name: 'value',
          message: `${shouldDelete.reason}. Delete it?`,
          initial: true,
        },
        {
          onCancel: () => {
            throw new KilledError();
          },
        }
      )
    ).value === true
  );
}
