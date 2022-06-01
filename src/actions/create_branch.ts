import { TContext } from '../lib/context';
import { SCOPE } from '../lib/engine/scope_spec';
import { ExitFailedError } from '../lib/errors';
import { addAll } from '../lib/git/add_all';
import { detectStagedChanges } from '../lib/git/detect_staged_changes';
import { newBranchName } from '../lib/utils/branch_name';
import { restackBranches } from './restack';

export async function createBranchAction(
  opts: {
    branchName?: string;
    commitMessage?: string;
    addAll?: boolean;
    restack?: boolean;
  },
  context: TContext
): Promise<void> {
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

  context.metaCache.checkoutNewBranch(branchName);

  const isAddingEmptyCommit = !detectStagedChanges();

  /**
   * Here, we silence errors and ignore them. This
   * isn't great but our main concern is that we're able to create
   * and check out the new branch and these types of error point to
   * larger failure outside of our control.
   */
  context.metaCache.commit({
    allowEmpty: isAddingEmptyCommit,
    message: opts.commitMessage,
    rollbackOnError: () => context.metaCache.deleteBranch(branchName),
  });

  if (opts.restack) {
    restackSiblings(branchName, context);
  }
}

function restackSiblings(branchName: string, context: TContext) {
  // If we're restacking siblings onto this branch, we need to restack
  // all of their recursive children as well. Get all the upstacks!
  const branchesToRestack = context.metaCache
    .getChildren(context.metaCache.getParentPrecondition(branchName))
    .filter((childBranchName) => childBranchName !== branchName)
    .flatMap((childBranchName) => {
      // Here we actually set the parent of each sibling to the new branch
      context.metaCache.setParent(childBranchName, branchName);
      return context.metaCache.getRelativeStack(childBranchName, SCOPE.UPSTACK);
    });

  restackBranches({ relative: false, branchNames: branchesToRestack }, context);
}
