import { TContext } from '../lib/context';
import { ExitFailedError } from '../lib/errors';
import { addAll } from '../lib/git/add_all';
import { checkoutBranch } from '../lib/git/checkout_branch';
import { commit } from '../lib/git/commit';
import { deleteBranch } from '../lib/git/deleteBranch';
import { detectStagedChanges } from '../lib/git/detect_staged_changes';
import { currentBranchPrecondition } from '../lib/preconditions';
import { newBranchName } from '../lib/utils/branch_name';
import { Branch } from '../wrapper-classes/branch';
import { MetaStackBuilder } from '../wrapper-classes/meta_stack_builder';
import { currentBranchOntoAction } from './onto/current_branch_onto';

export async function createBranchAction(
  opts: {
    branchName?: string;
    commitMessage?: string;
    addAll?: boolean;
    restack?: boolean;
  },
  context: TContext
): Promise<void> {
  const parentBranch = currentBranchPrecondition(context);

  const branchName = newBranchName(
    opts.branchName,
    opts.commitMessage,
    context
  );
  if (!branchName) {
    throw new ExitFailedError(
      `Must specify either a branch name or commit message`
    );
  }

  if (opts.addAll) {
    addAll();
  }

  checkoutBranch(branchName, { new: true });

  const isAddingEmptyCommit = !detectStagedChanges();

  /**
   * Here, we silence errors and ignore them. This
   * isn't great but our main concern is that we're able to create
   * and check out the new branch and these types of error point to
   * larger failure outside of our control.
   */
  commit({
    allowEmpty: isAddingEmptyCommit,
    message: opts.commitMessage,
    noVerify: context.noVerify,
    rollbackOnError: () => {
      // Commit failed, usually due to precommit hooks. Rollback the branch.
      checkoutBranch(parentBranch.name, { quiet: true });
      deleteBranch(branchName);
    },
  });

  // If the branch previously existed and the stale metadata is still around,
  // make sure that we wipe that stale metadata.
  Branch.create(branchName, parentBranch.name, parentBranch.getCurrentRef());

  if (isAddingEmptyCommit) {
    context.splog.logInfo(
      'Since no changes were staged, an empty commit was added to track Graphite stack dependencies. If you wish to get rid of the empty commit you can amend, or squash when merging.'
    );
  }

  if (opts.restack) {
    new MetaStackBuilder()
      .upstackInclusiveFromBranchWithoutParents(parentBranch, context)
      .source.children.map((node) => node.branch)
      .filter((b) => b.name != branchName)
      .forEach((b) => {
        checkoutBranch(b.name, { quiet: true });
        context.splog.logInfo(`Stacking (${b.name}) onto (${branchName})...`);
        currentBranchOntoAction(
          {
            onto: branchName,
            mergeConflictCallstack: [],
          },
          context
        );
      });
    checkoutBranch(branchName, { quiet: true });
  }
}
