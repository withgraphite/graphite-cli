import { default as chalk } from 'chalk';
import prompts from 'prompts';
import { TContext } from '../lib/context';
import { KilledError } from '../lib/errors';
import { deleteBranchAction, isSafeToDelete } from './delete_branch';

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
  context.splog.logInfo(
    `Checking if any branches have been merged/closed and can be deleted...`
  );
  context.splog.logTip(
    `Disable this behavior at any point in the future with --no-delete`
  );

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
      branchesToProcess.concat(children);

      // Value in branchesToDelete is a list of children blocking deletion.
      branchesToDelete[branchName] = new Set(children);
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
        context.metaCache.setParent(
          branchName,
          context.metaCache.getParentPrecondition(parentBranchName)
        );
        context.splog.logInfo(
          `Set parent of ${chalk.cyan(branchName)} to (${chalk.blue(
            parentBranchName
          )}).`
        );
        branchesWithNewParents.push(branchName);

        // This branch is no longer blocking its parent's deletion.
        branchesToDelete[parentBranchName].delete(branchName);
      }
    }

    // With either of the paths above, we may have unblocked a branch that can
    // be deleted immediately. We repeatedly check for branches that can be
    // deleted, because the act of deleting one branch may free up another.
    const unblockedBranches = Object.keys(branchesToDelete).filter(
      (branchToDelete) => branchesToDelete[branchToDelete].size === 0
    );

    while (unblockedBranches.length > 0) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const branchToDelete = unblockedBranches.pop()!;

      deleteBranchAction({ branchName: branchToDelete, force: true }, context);

      // Remove the branch from the list of branches to delete.
      delete branchesToDelete[branchToDelete];

      // This branch is no longer blocking its parent's deletion.
      const parentBranchName =
        context.metaCache.getParentPrecondition(branchToDelete);
      if (parentBranchName in branchesToDelete) {
        branchesToDelete[parentBranchName].delete(branchName);

        // Check if we can delete the parent immediately.
        if (branchesToDelete[parentBranchName].size === 0) {
          unblockedBranches.push(parentBranchName);
        }
      }
    }
  }
  return branchesWithNewParents;
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
