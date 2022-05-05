import { TContext } from '../lib/context';
import { ensureSomeStagedChangesPrecondition } from '../lib/preconditions';
import { addAll } from '../lib/utils/addAll';
import { commit } from '../lib/utils/commit';
import { rebaseUpstack } from './fix';

export async function commitCreateAction(
  opts: {
    addAll: boolean;
    message: string | undefined;
  },
  context: TContext
): Promise<void> {
  if (opts.addAll) {
    addAll();
  }

  ensureSomeStagedChangesPrecondition(context);

  commit({ message: opts.message });

  await rebaseUpstack(context);
}
