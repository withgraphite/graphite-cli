import { TContext } from '../context';
import { gpExecSync } from '../utils/exec_sync';

export function getRemoteBranchNames(context: TContext): string[] {
  return gpExecSync({
    command: `git ls-remote -h ${context.repoConfig.getRemote()}`,
  })
    .split('\n')
    .map((line) => line.split('refs/heads/')[1]);
}
