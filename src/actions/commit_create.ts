import { TContext } from '../lib/context';
import { SCOPE } from '../lib/engine/scope_spec';
import { addAll } from '../lib/git/add_all';
import { ensureSomeStagedChangesPrecondition } from '../lib/preconditions';
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
