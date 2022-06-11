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
    insert?: boolean;
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

  // The reason we get the list of siblings here instead of having all
  // the `--insert` logic in a separate function is so that we only
  // show the tip if the user creates a branch with siblings.

  const siblings = context.metaCache
    .getChildren(context.metaCache.getParentPrecondition(branchName))
    .filter((childBranchName) => childBranchName !== branchName);

  if (siblings.length === 0) {
    return;
  }

  if (!opts.insert) {
    context.splog.tip(
      [
        'To insert a created branch into the middle of your stack, use the `--insert` flag.',
        "If you meant to insert this branch, you can rearrange your stack's dependencies with `gt upstack onto`",
      ].join('\n')
    );
    return;
  }

  // Now we actually handle the `insert` case.

  // Change the parent of each sibling to the new branch.
  siblings.forEach((siblingBranchName) =>
    context.metaCache.setParent(siblingBranchName, branchName)
  );

  // If we're restacking siblings onto this branch, we need to restack
  // all of their recursive children as well. Get all the upstacks!
  restackBranches(
    siblings.flatMap((siblingBranchName) =>
      context.metaCache.getRelativeStack(siblingBranchName, SCOPE.UPSTACK)
    ),
    context
  );
}
