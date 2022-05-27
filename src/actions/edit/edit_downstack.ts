import { TContext } from '../../lib/context';
import { ExitFailedError } from '../../lib/errors';
import { switchBranch } from '../../lib/git/checkout_branch';
import { currentBranchPrecondition } from '../../lib/preconditions';
import { getDefaultEditorOrPrompt } from '../../lib/utils/default_editor';
import { gpExecSync } from '../../lib/utils/exec_sync';
import { performInTmpDir } from '../../lib/utils/perform_in_tmp_dir';
import { getTrunk } from '../../lib/utils/trunk';
import { MetaStackBuilder } from '../../wrapper-classes/meta_stack_builder';
import { Stack } from '../../wrapper-classes/stack';
import { validate } from '../validate';
import { applyStackEditPick } from './apply_stack_edit';
import { createStackEditFile } from './create_stack_edit_file';
import { parseEditFile } from './parse_stack_edit_file';

export async function editDownstack(
  inputPath: string | undefined,
  context: TContext
): Promise<void> {
  // We're about to do some complex re-arrangements - ensure state is consistant before beginning.
  validate('DOWNSTACK', context);

  const currentBranch = currentBranchPrecondition();
  const stack = new MetaStackBuilder().downstackFromBranch(
    currentBranch,
    context
  );
  const stackEdits = inputPath
    ? parseEditFile(inputPath) // allow users to pass a pre-written file, mostly for unit tests.
    : await promptForEdit(stack, context);
  applyStackEdits(getTrunk(context).name, stackEdits, context);
}

export function applyStackEdits(
  fromBranchName: string,
  branchNames: string[],
  context: TContext
): void {
  switchBranch(fromBranchName);
  branchNames.forEach((branchName, index) => {
    applyStackEditPick(
      {
        branchName: branchName,
        remainingBranchNames: branchNames.slice(index),
      },
      context
    );
  });
}

async function promptForEdit(
  stack: Stack,
  context: TContext
): Promise<string[]> {
  const defaultEditor = await getDefaultEditorOrPrompt(context);
  return performInTmpDir((tmpDir) => {
    const editFilePath = createStackEditFile({ stack, tmpDir }, context);
    gpExecSync(
      {
        command: `${defaultEditor} "${editFilePath}"`,
        options: { stdio: 'inherit' },
      },
      (err) => {
        throw new ExitFailedError(
          'Failed to prompt for stack edit. Aborting...',
          err
        );
      }
    );
    return parseEditFile(editFilePath);
  });
}
