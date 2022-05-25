import { Branch } from '../wrapper-classes/branch';
import { TContext } from './context';
import { PreconditionsFailedError } from './errors';
import { branchExists } from './git/branch_exists';
import { detectStagedChanges } from './git/detect_staged_changes';
import {
  trackedUncommittedChanges,
  unstagedChanges,
} from './git/git_status_utils';
import { gpExecSync } from './utils/exec_sync';
import { logTip } from './utils/splog';

function currentBranchPrecondition(context: TContext): Branch {
  const branch = Branch.currentBranch();
  if (!branch) {
    throw new PreconditionsFailedError(
      `Cannot find current branch. Please ensure you're running this command atop a checked-out branch.`
    );
  }
  if (context.repoConfig.branchIsIgnored(branch.name)) {
    throw new PreconditionsFailedError(
      [
        `Cannot use graphite atop (${branch.name}) which is explicitly ignored in your repo config.`,
        `If you'd like to edit your ignored branches, consider running "gt repo ignored-branches --help" for options, or manually editing your ".git/.graphite_repo_config" file.`,
      ].join('\n')
    );
  }
  return branch;
}

function branchExistsPrecondition(branchName: string): void {
  if (!branchExists(branchName)) {
    throw new PreconditionsFailedError(
      `Cannot find branch named: (${branchName}).`
    );
  }
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
    logTip(
      'There are unstaged changes. Use -a option to stage all unstaged changes.',
      context
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
  });
  if (!repoRootPath || repoRootPath.length === 0) {
    throw new PreconditionsFailedError('No .git repository found.');
  }
  return repoRootPath;
}

export {
  currentBranchPrecondition,
  branchExistsPrecondition,
  uncommittedTrackedChangesPrecondition,
  currentGitRepoPrecondition,
  ensureSomeStagedChangesPrecondition,
  cliAuthPrecondition,
};
