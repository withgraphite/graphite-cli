import { TContext } from '../../lib/context/context';
import { ExitFailedError } from '../../lib/errors';
import {
  checkoutBranch,
  getTrunk,
  gpExecSync,
  logInfo,
  logNewline,
  logTip,
} from '../../lib/utils';

export function pull(context: TContext, oldBranchName: string): void {
  logInfo(`Pulling in new changes...`);
  logTip(
    `Disable this behavior at any point in the future with --no-pull`,
    context
  );
  gpExecSync({ command: `git pull --prune` }, (err) => {
    checkoutBranch(oldBranchName);
    throw new ExitFailedError(
      `Failed to pull trunk ${getTrunk(context).name}`,
      err
    );
  });
  logNewline();
}
