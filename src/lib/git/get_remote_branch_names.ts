import { TContext } from '../context';
import { gpExecSyncAndSplitLines } from '../utils/exec_sync';

export function getRemoteBranchNames(context: TContext): string[] {
  return gpExecSyncAndSplitLines({
    command: `git ls-remote -h ${context.repoConfig.getRemote()}`,
  }).map((line) => line.split('refs/heads/')[1]);
}
