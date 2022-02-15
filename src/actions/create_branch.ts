import { execStateConfig, userConfig } from '../lib/config';
import { ExitFailedError } from '../lib/errors';
import { currentBranchPrecondition } from '../lib/preconditions';
import { checkoutBranch, gpExecSync } from '../lib/utils';
import Branch from '../wrapper-classes/branch';

export async function createBranchAction(opts: {
  branchName?: string;
  commitMessage?: string;
  addAll?: boolean;
}): Promise<void> {
  const parentBranch = currentBranchPrecondition();

  if (opts.addAll) {
    gpExecSync(
      {
        command: 'git add --all',
      },
      () => {
        throw new ExitFailedError(
          'Could not add all staged changes. Aborting...'
        );
      }
    );
  }

  const branchName = newBranchName(opts.branchName, opts.commitMessage);
  checkoutNewBranch(branchName);

  /**
   * Here, we silence errors and ignore them. This
   * isn't great but our main concern is that we're able to create
   * and check out the new branch and these types of error point to
   * larger failure outside of our control.
   */
  gpExecSync(
    {
      command: `git commit --allow-empty --allow-empty-message -m "${
        opts.commitMessage
      }" ${execStateConfig.noVerify() ? '--no-verify' : ''}`,
      options: {
        stdio: 'inherit',
      },
    },
    (err) => {
      // Commit failed, usually due to precommit hooks. Rollback the branch.
      checkoutBranch(parentBranch.name);
      gpExecSync({
        command: `git branch -d ${branchName}`,
        options: { stdio: 'ignore' },
      });
      throw new ExitFailedError('Failed to commit changes, aborting', err);
    }
  );

  // If the branch previously existed and the stale metadata is still around,
  // make sure that we wipe that stale metadata.
  new Branch(branchName).clearMetadata().setParentBranchName(parentBranch.name);
}

function newBranchName(branchName?: string, commitMessage?: string): string {
  if (!branchName && !commitMessage) {
    throw new ExitFailedError(
      `Must specify at least a branch name or commit message`
    );
  } else if (branchName) {
    return branchName;
  }

  const date = new Date();

  const MAX_BRANCH_NAME_LENGTH = 40;
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  let branchMessage = commitMessage!
    .split('')
    .map((c) => {
      if (ALLOWED_BRANCH_CHARACTERS.includes(c)) {
        return c;
      }
      return '_'; // Replace all disallowed characters with _
    })
    .join('')
    .replace(/_+/g, '_');

  if (branchMessage.length <= MAX_BRANCH_NAME_LENGTH - 6) {
    // prepend date if there's room.
    branchMessage =
      `${('0' + (date.getMonth() + 1)).slice(-2)}-${(
        '0' + date.getDate()
      ).slice(-2)}-` + branchMessage; // Condence underscores
  }

  const newBranchName = `${userConfig.getBranchPrefix() || ''}${branchMessage}`;
  return newBranchName.slice(0, MAX_BRANCH_NAME_LENGTH);
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
