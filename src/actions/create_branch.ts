import { TContext } from '../lib/context/context';
import { ExitFailedError } from '../lib/errors';
import { currentBranchPrecondition } from '../lib/preconditions';
import {
  checkoutBranch,
  detectStagedChanges,
  gpExecSync,
  logInfo,
} from '../lib/utils';
import { addAll } from '../lib/utils/addAll';
import { commit } from '../lib/utils/commit';
import { Branch } from '../wrapper-classes/branch';

// 255 minus 21 (for 'refs/branch-metadata/')
const MAX_BRANCH_NAME_BYTE_LENGTH = 234;

export async function createBranchAction(
  opts: {
    branchName?: string;
    commitMessage?: string;
    addAll?: boolean;
  },
  context: TContext
): Promise<void> {
  const parentBranch = currentBranchPrecondition(context);

  if (opts.addAll) {
    addAll();
  }

  const branchName =
    opts.branchName ?? newBranchName(context, opts.commitMessage);
  checkoutNewBranch(branchName);

  const isAddingEmptyCommit = !detectStagedChanges();

  /**
   * Here, we silence errors and ignore them. This
   * isn't great but our main concern is that we're able to create
   * and check out the new branch and these types of error point to
   * larger failure outside of our control.
   */
  commit({
    allowEmpty: isAddingEmptyCommit,
    message: opts.commitMessage,
    rollbackOnError: () => {
      // Commit failed, usually due to precommit hooks. Rollback the branch.
      checkoutBranch(parentBranch.name, { quiet: true });
      gpExecSync({
        command: `git branch -d ${branchName}`,
        options: { stdio: 'ignore' },
      });
      throw new ExitFailedError('Failed to commit changes, aborting');
    },
  });

  // If the branch previously existed and the stale metadata is still around,
  // make sure that we wipe that stale metadata.
  Branch.create(branchName, parentBranch.name, parentBranch.getCurrentRef());

  if (isAddingEmptyCommit) {
    logInfo(
      'Since no changes were staged, an empty commit was added to track Graphite stack dependencies. If you wish to get rid of the empty commit you can amend, or squash when merging.'
    );
  }
}

function newBranchName(context: TContext, commitMessage?: string): string {
  if (!commitMessage) {
    throw new ExitFailedError(
      `Must specify at least a branch name or commit message`
    );
  }

  const branchPrefix = context.userConfig.data.branchPrefix || '';

  const date = new Date();
  const branchDate = `${('0' + (date.getMonth() + 1)).slice(-2)}-${(
    '0' + date.getDate()
  ).slice(-2)}-`;

  const branchMessage = commitMessage
    .split('')
    .map((c) => {
      if (ALLOWED_BRANCH_CHARACTERS.includes(c)) {
        return c;
      }
      return '_'; // Replace all disallowed characters with _
    })
    .join('')
    .replace(/_+/g, '_'); // Condense underscores

  // https://stackoverflow.com/questions/60045157/what-is-the-maximum-length-of-a-github-branch-name
  // GitHub's max branch name size is computed based on a maximum ref name length (including
  // 'refs/heads/') of 256 bytes, so we need to convert to a Buffer and back to slice correctly.
  return Buffer.from(branchPrefix + branchDate + branchMessage)
    .slice(0, MAX_BRANCH_NAME_BYTE_LENGTH)
    .toString();
}

function checkoutNewBranch(branchName: string): void {
  gpExecSync(
    {
      command: `git checkout -b "${branchName}"`,
    },
    (err) => {
      throw new ExitFailedError(
        `Failed to checkout new branch ${branchName}`,
        err
      );
    }
  );
}

const ALLOWED_BRANCH_CHARACTERS = [
  '_',
  '-',
  '0',
  '1',
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
  'a',
  'b',
  'c',
  'd',
  'e',
  'f',
  'g',
  'h',
  'i',
  'j',
  'k',
  'l',
  'm',
  'n',
  'o',
  'p',
  'q',
  'r',
  's',
  't',
  'u',
  'v',
  'w',
  'x',
  'y',
  'z',
  'A',
  'B',
  'C',
  'D',
  'E',
  'F',
  'G',
  'H',
  'I',
  'J',
  'K',
  'L',
  'M',
  'N',
  'O',
  'P',
  'Q',
  'R',
  'S',
  'T',
  'U',
  'V',
  'W',
  'X',
  'Y',
  'Z',
];
