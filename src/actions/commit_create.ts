import { TContext } from '../lib/context';
import { addAll } from '../lib/git/add_all';
import { ensureSomeStagedChangesPrecondition } from '../lib/preconditions';
import { restackCurrentUpstackExclusive } from './restack';

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

  context.metaCache.commit({ message: opts.message });
  restackCurrentUpstackExclusive(context);
}
