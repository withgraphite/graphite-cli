import Branch from '../../wrapper-classes/branch';
import { repoConfig, userConfig } from '../config';
import { PreconditionsFailedError } from '../errors';
import {
  detectStagedChanges,
  gpExecSync,
  logTip,
  uncommittedChanges,
  unstagedChanges,
} from '../utils';
import { trackedUncommittedChanges } from '../utils/git_status_utils';

function addAllAvailableTip(): void {
  if (unstagedChanges()) {
    logTip(
      'There are unstaged changes. Use -a option to stage all unstaged changes.'
    );
  }
}

function currentBranchPrecondition(): Branch {
  const branch = Branch.getCurrentBranch();
  if (!branch) {
    throw new PreconditionsFailedError(
      `Cannot find current branch. Please ensure you're running this command atop a checked-out branch.`
    );
  }
  if (repoConfig.branchIsIgnored(branch.name)) {
    throw new PreconditionsFailedError(
      [
        `Cannot use graphite atop (${branch.name}) which is explicitly ignored in your repo config.`,
        `If you'd like to edit your ignored branches, consider running "gt repo init", or manually editing your ".git/.graphite_repo_config" file.`,
      ].join('\n')
    );
  }
  return branch;
}

function branchExistsPrecondition(branchName: string): void {
  if (!Branch.exists(branchName)) {
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

function uncommittedChangesPrecondition(): void {
  if (uncommittedChanges()) {
    throw new PreconditionsFailedError(
      `Cannot run with untracked or uncommitted changes present, please resolve and then retry.`
    );
  }
}

function ensureSomeStagedChangesPrecondition(
  addAllLogTipEnabled?: boolean
): void {
  if (!detectStagedChanges()) {
    gpExecSync({ command: `git status`, options: { stdio: 'ignore' } });
    if (addAllLogTipEnabled) {
      addAllAvailableTip();
    }
    throw new PreconditionsFailedError(`Cannot run without staged changes.`);
  }
}

function cliAuthPrecondition(): string {
  const token = userConfig.getAuthToken();
  if (!token || token.length === 0) {
    throw new PreconditionsFailedError(
      'Please authenticate your Graphite CLI by visiting https://app.graphite.dev/activate.'
    );
  }
  return token;
}

function currentGitRepoPrecondition(): string {
  const repoRootPath = gpExecSync(
    {
      command: `git rev-parse --show-toplevel`,
    },
    () => {
      return Buffer.alloc(0);
    }
  )
    .toString()
    .trim();
  if (!repoRootPath || repoRootPath.length === 0) {
    throw new PreconditionsFailedError('No .git repository found.');
  }
  return repoRootPath;
}

export {
  currentBranchPrecondition,
  branchExistsPrecondition,
  uncommittedTrackedChangesPrecondition,
  uncommittedChangesPrecondition,
  currentGitRepoPrecondition,
  ensureSomeStagedChangesPrecondition,
  cliAuthPrecondition,
};
