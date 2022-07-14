import { TContext } from './context';
import { PreconditionsFailedError } from './errors';
import { detectStagedChanges } from './git/diff';
import {
  trackedUncommittedChanges,
  unstagedChanges,
} from './git/git_status_utils';
import { gpExecSync } from './utils/exec_sync';

export function getRepoRootPathPrecondition(): string {
  const repoRootPath = gpExecSync({
    command: `git rev-parse --git-common-dir`,
    onError: 'ignore',
  });
  if (!repoRootPath) {
    throw new PreconditionsFailedError('No .git repository found.');
  }
  return repoRootPath;
}

function uncommittedTrackedChangesPrecondition(): void {
  if (trackedUncommittedChanges()) {
    throw new PreconditionsFailedError(
      `There are tracked changes that have not been committed. Please resolve and then retry.`
    );
  }
}

function ensureSomeStagedChangesPrecondition(context: TContext): void {
  if (detectStagedChanges()) {
    return;
  }

  if (unstagedChanges()) {
    context.splog.tip(
      'There are unstaged changes. Use the `--all` option to stage all changes.'
    );
  }

  throw new PreconditionsFailedError(`Cannot run without staged changes.`);
}

function cliAuthPrecondition(context: TContext): string {
  const token = context.userConfig.data.authToken;
  if (!token || token.length === 0) {
    throw new PreconditionsFailedError(
      'Please authenticate your Graphite CLI by visiting https://app.graphite.dev/activate.'
    );
  }
  return token;
}

function currentGitRepoPrecondition(): string {
  const repoRootPath = gpExecSync({
    command: `git rev-parse --show-toplevel`,
    onError: 'ignore',
  });
  if (!repoRootPath) {
    throw new PreconditionsFailedError('No .git repository found.');
  }
  return repoRootPath;
}

export {
  uncommittedTrackedChangesPrecondition,
  currentGitRepoPrecondition,
  ensureSomeStagedChangesPrecondition,
  cliAuthPrecondition,
};
