import chalk from 'chalk';
import yargs from 'yargs';
import { cache } from '../../lib/config/cache';
import { ExitFailedError } from '../../lib/errors';
import { currentBranchPrecondition } from '../../lib/preconditions';
import { profile } from '../../lib/telemetry/profile';
import { replaceUnsupportedCharacters } from '../../lib/utils/branch_name';
import { gpExecSync } from '../../lib/utils/exec_sync';
import { logInfo } from '../../lib/utils/splog';
import { Branch } from '../../wrapper-classes/branch';
import { MetadataRef } from '../../wrapper-classes/metadata_ref';

const args = {
  'new-branch-name': {
    describe: `The new name for the current branch`,
    demandOption: true,
    type: 'string',
    positional: true,
  },
  force: {
    describe: `Allow renaming a branch that is already associated with a GitHub pull request.`,
    demandOption: false,
    type: 'boolean',
    alias: 'f',
    default: false,
  },
} as const;
type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;

export const command = 'rename <new-branch-name>';
export const canonical = 'branch rename';
export const description =
  'Rename a branch and update metadata referencing it.';
export const builder = args;

export const handler = async (args: argsT): Promise<void> => {
  return profile(args, canonical, async (context) => {
    const currentBranch = currentBranchPrecondition(context);
    const oldName = currentBranch.name;
    const newName = replaceUnsupportedCharacters(
      args['new-branch-name'],
      context
    );
    const allBranches = Branch.allBranches(context);

    if (currentBranch.getPRInfo()?.number && !args.force) {
      throw new ExitFailedError(
        'Renaming a branch for a submitted PR requires the `--force` option'
      );
    }

    gpExecSync({ command: `git branch -m ${newName}` }, (err) => {
      throw new ExitFailedError(`Failed to rename the current branch.`, err);
    });

    // Good habit to clear cache after write operations.
    cache.clearAll();

    currentBranch.clearPRInfo();

    const curBranchMetadataRef = new MetadataRef(currentBranch.name);
    curBranchMetadataRef.rename(newName);

    // Update any references to the branch.
    allBranches.forEach((branch) => {
      if (MetadataRef.getMeta(branch.name)?.parentBranchName === oldName) {
        branch.setParentBranchName(newName);
      }
    });

    logInfo(`Successfully renamed (${oldName}) to (${chalk.green(newName)})`);
  });
};
