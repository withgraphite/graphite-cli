import { TContext } from '../lib/context';
import { SCOPE } from '../lib/engine/scope_spec';
import { ExitFailedError } from '../lib/errors';
import { addAll } from '../lib/git/add_all';
import { detectStagedChanges } from '../lib/git/diff';
import { newBranchName } from '../lib/utils/branch_name';
import { restackBranches } from './restack';

export async function createBranchAction(
  opts: {
    branchName?: string;
    message?: string;
    all?: boolean;
    restack?: boolean;
  },
  context: TContext
): Promise<void> {
  const branchName = newBranchName(opts.branchName, opts.message, context);
  if (!branchName) {
    throw new ExitFailedError(
      `Must specify either a branch name or commit message`
    );
  }

  if (opts.all) {
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
    message: opts.message,
    rollbackOnError: () => context.metaCache.deleteBranch(branchName),
  });

  if (opts.restack) {
    restackSiblings(branchName, context);
  } else {
    context.splog.tip(
      'To insert a branch into a stack, try out the `--restack` flag.'
    );
    return;
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

  restackBranches(branchesToRestack, context);
}
