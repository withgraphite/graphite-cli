import { default as chalk } from 'chalk';
import prompts from 'prompts';
import { cache } from '../lib/config/cache';
import {
  TDeleteBranchesStackFrame,
  TMergeConflictCallstack,
} from '../lib/config/merge_conflict_callstack_config';
import { TContext } from '../lib/context';
import { KilledError } from '../lib/errors';
import { checkoutBranch } from '../lib/git/checkout_branch';
import { isMerged } from '../lib/git/is_merged';
import { getTrunk } from '../lib/utils/trunk';
import { Branch } from '../wrapper-classes/branch';
import { deleteBranchAction } from './delete_branch';
import { currentBranchOntoAction } from './onto/current_branch_onto';

/**
 * This method is assumed to be idempotent -- if a merge conflict interrupts
 * execution of this method, we simply restart the method upon running `gt
 * continue`.
 */
// eslint-disable-next-line max-lines-per-function
export async function cleanBranches(
  opts: {
    frame: TDeleteBranchesStackFrame;
    parent: TMergeConflictCallstack;
    showSyncTip?: boolean;
  },
  context: TContext
): Promise<void> {
  context.splog.logInfo(
    `Checking if any branches have been merged/closed and can be deleted...`
  );
  if (opts.showSyncTip) {
    context.splog.logTip(
      `Disable this behavior at any point in the future with --no-delete`
    );
  }

  const trunkChildren = getTrunk(context).getChildrenFromMeta(context);

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
  let toProcess: Branch[] = trunkChildren;
  const branchesToDelete: Record<
    string,
    {
      branch: Branch;
      children: Branch[];
    }
  > = {};

  /**
   * Since we're doing a DFS, assuming rather even distribution of stacks off
   * of trunk children, we can trace the progress of the DFS through the trunk
   * children to give the user a sense of how far the repo sync has progressed.
   * Note that we only do this if the user has a large number of branches off
   * of trunk (> 50).
   */
  const trunkChildrenProgressMarkers: Record<string, string> = {};
  if (opts.frame.showDeleteProgress) {
    trunkChildren.forEach((child, i) => {
      // Ignore the first child - don't show 0% progress.
      if (i === 0) {
        return;
      }

      trunkChildrenProgressMarkers[child.name] = `${+(
        // Add 1 to the overall children length to account for the fact that
        // when we're on the last trunk child, we're not 100% done - we need
        // to go through its stack.
        ((i / (trunkChildren.length + 1)) * 100).toFixed(2)
      )}%`;
    });
  }

  do {
    const branch = toProcess.shift();
    if (branch === undefined) {
      break;
    }

    if (branch.name in branchesToDelete) {
      continue;
    }

    if (
      opts.frame.showDeleteProgress &&
      branch.name in trunkChildrenProgressMarkers
    ) {
      context.splog.logInfo(
        `${
          trunkChildrenProgressMarkers[branch.name]
        } done searching for merged/closed branches to delete...`
      );
    }

    const shouldDelete = await shouldDeleteBranch(
      {
        branch: branch,
        force: opts.frame.force,
      },
      context
    );
    if (shouldDelete) {
      const children = branch.getChildrenFromMeta(context);

      // We concat toProcess to children here (because we shift above) to make
      // our search a DFS.
      toProcess = children.concat(toProcess);

      branchesToDelete[branch.name] = {
        branch: branch,
        children: children,
      };
    } else {
      const parent = branch.getParentFromMeta(context);
      const parentName = parent?.name;

      // If we've reached this point, we know the branch shouldn't be deleted.
      // This means that we may need to rebase it - if the branch's parent is
      // going to be deleted.
      if (parentName !== undefined && parentName in branchesToDelete) {
        checkoutBranch(branch.name, { quiet: true });
        context.splog.logInfo(
          `Stacking (${branch.name}) onto (${getTrunk(context).name})...`
        );
        currentBranchOntoAction(
          {
            onto: getTrunk(context).name,
            mergeConflictCallstack: [opts.frame, ...opts.parent],
          },
          context
        );

        branchesToDelete[parentName].children = branchesToDelete[
          parentName
        ].children.filter((child) => child.name !== branch.name);
      }
    }

    checkoutBranch(getTrunk(context).name, { quiet: true });

    // With either of the paths above, we may have unblocked a branch that can
    // be deleted immediately. We recursively check whether we can delete a
    // branch (until we can't), because the act of deleting one branch may free
    // up another.
    let branchToDeleteName;
    do {
      branchToDeleteName = Object.keys(branchesToDelete).find(
        (branchToDelete) =>
          branchesToDelete[branchToDelete].children.length === 0
      );
      if (branchToDeleteName === undefined) {
        continue;
      }

      const branch = branchesToDelete[branchToDeleteName].branch;
      const parentName = branch.getParentFromMeta(context)?.name;
      if (parentName !== undefined && parentName in branchesToDelete) {
        branchesToDelete[parentName].children = branchesToDelete[
          parentName
        ].children.filter((child) => child.name !== branch.name);
      }

      deleteBranch(branch, context);
      delete branchesToDelete[branchToDeleteName];
    } while (branchToDeleteName !== undefined);
  } while (toProcess.length > 0);
}

async function shouldDeleteBranch(
  args: {
    branch: Branch;
    force: boolean;
  },
  context: TContext
): Promise<boolean> {
  const mergedBase = mergedBaseIfMerged(args.branch, context);
  if (!mergedBase && args.branch.getPRInfo()?.state !== 'CLOSED') {
    return false;
  }

  if (args.force) {
    return true;
  } else if (!context.interactive) {
    return false;
  }

  return (
    (
      await prompts(
        {
          type: 'confirm',
          name: 'value',
          message: `Delete (${chalk.green(args.branch.name)}), which has been ${
            mergedBase ? `merged into (${mergedBase})` : 'closed on GitHub'
          }?`,
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

// Where did we merge this? If it was merged on GitHub, we see where it was
// merged into. If we don't detect that it was merged in GitHub but we do
// see the code in trunk, we fallback to say that it was merged into trunk.
// This extra check (rather than just saying trunk) is used to catch the
// case where one feature branch is merged into another on GitHub.
export function mergedBaseIfMerged(
  branch: Branch,
  context: TContext
): string | undefined {
  const trunkName = getTrunk(context).name;
  return branch.getPRInfo()?.state === 'MERGED'
    ? branch.getPRInfo()?.base ?? trunkName
    : isMerged({ branchName: branch.name, trunkName })
    ? trunkName
    : undefined;
}

function deleteBranch(branch: Branch, context: TContext) {
  context.splog.logInfo(`Deleting (${chalk.red(branch.name)})`);
  deleteBranchAction(
    {
      branchName: branch.name,
      force: true,
    },
    context
  );
  cache.clearAll();
}
