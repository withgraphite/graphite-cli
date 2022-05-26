import { TContext } from '../lib/context';
import { addAll } from '../lib/git/add_all';
import { ensureSomeStagedChangesPrecondition } from '../lib/preconditions';
import { SCOPE } from '../lib/state/scope_spec';
import { restackBranches } from './restack';

export function commitCreateAction(
  opts: {
    addAll: boolean;
    message?: string;
  },
  context: TContext
): void {
  if (opts.addAll) {
    addAll();
  }

  ensureSomeStagedChangesPrecondition(context);
  context.metaCache.commit({
    noVerify: context.noVerify,
    message: opts.message,
  });
  restackBranches({ relative: true, scope: SCOPE.UPSTACK_EXCLUSIVE }, context);
}
