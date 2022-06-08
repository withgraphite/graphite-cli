import { TContext } from '../lib/context';
import { SCOPE } from '../lib/engine/scope_spec';
import { addAll } from '../lib/git/add_all';
import { ensureSomeStagedChangesPrecondition } from '../lib/preconditions';
import { restackBranches } from './restack';

export function commitAmendAction(
  opts: {
    addAll: boolean;
    message?: string;
    noEdit: boolean;
  },
  context: TContext
): void {
  if (opts.addAll) {
    addAll();
  }

  if (opts.noEdit) {
    ensureSomeStagedChangesPrecondition(context);
  }

  context.metaCache.commit({
    amend: true,
    noEdit: opts.noEdit,
    message: opts.message,
  });

  if (!opts.noEdit) {
    context.splog.logTip(
      'In the future, you can skip editing the commit message with the `--no-edit` flag.'
    );
  }

  restackBranches(
    context.metaCache.getRelativeStack(
      context.metaCache.currentBranchPrecondition,
      SCOPE.UPSTACK_EXCLUSIVE
    ),
    context
  );
}
