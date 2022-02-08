import {
  clearPendingStackEdits,
  savePendingStackEdits,
} from '../../lib/config/pending_stack_edits_config';
import { ExitFailedError } from '../../lib/errors';
import { currentBranchPrecondition } from '../../lib/preconditions';
import { gpExecSync } from '../../lib/utils';
import { getDefaultEditorOrPrompt } from '../../lib/utils/default_editor';
import { performInTmpDir } from '../../lib/utils/perform_in_tmp_dir';
import { MetaStackBuilder } from '../../wrapper-classes';
import Stack from '../../wrapper-classes/stack';
import { validate } from '../validate';
import { applyStackEditPick } from './apply_stack_edit_pick';
import { createEditFile } from './create_stack_edit_file';
import { parseEditFile } from './parse_stack_edit_file';
import { TStackEdit } from './stack_edits';

export async function editDownstack(): Promise<void> {
  // We're about to do some complex re-arrangements - ensure state is consistant before beginning.
  await validate('DOWNSTACK');

  const currentBranch = currentBranchPrecondition();
  const stack = new MetaStackBuilder().downstackFromBranch(currentBranch);
  const stackEdits = await promptForEdit(stack);
  await applyStackEdits(stackEdits);
}

export async function applyStackEdits(stackEdits: TStackEdit[]): Promise<void> {
  for (let i = 0; i < stackEdits.length; i++) {
    savePendingStackEdits(stackEdits.slice(i)); // Write the remaining edits in case this one gets interupted.
    await processStackEdit(stackEdits[i]);
  }
  // Cleanup any pending files.
  clearPendingStackEdits();
}

async function processStackEdit(stackEdit: TStackEdit): Promise<void> {
  switch (stackEdit.type) {
    case 'pick':
      await applyStackEditPick(stackEdit);
  }
}

async function promptForEdit(stack: Stack) {
  const defaultEditor = await getDefaultEditorOrPrompt();
  return await performInTmpDir(async (tmpDir) => {
    const editFilePath = createEditFile({ stack, tmpDir });
    await gpExecSync(
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
    return parseEditFile({ filePath: editFilePath });
  });
}
