import { TContext } from '../../lib/context/context';
import { ExitFailedError } from '../../lib/errors';
import { currentBranchPrecondition } from '../../lib/preconditions';
import { gpExecSync } from '../../lib/utils';
import { getDefaultEditorOrPrompt } from '../../lib/utils/default_editor';
import { performInTmpDir } from '../../lib/utils/perform_in_tmp_dir';
import { MetaStackBuilder } from '../../wrapper-classes';
import Stack from '../../wrapper-classes/stack';
import { validate } from '../validate';
import { applyStackEditPick } from './apply_stack_edit_pick';
import { createStackEditFile } from './create_stack_edit_file';
import { parseEditFile } from './parse_stack_edit_file';
import { TStackEdit } from './stack_edits';

export async function editDownstack(
  context: TContext,
  opts?: {
    inputPath?: string;
  }
): Promise<void> {
  // We're about to do some complex re-arrangements - ensure state is consistant before beginning.
  await validate('DOWNSTACK', context);

  const currentBranch = currentBranchPrecondition(context);
  const stack = new MetaStackBuilder().downstackFromBranch(
    currentBranch,
    context
  );
  const stackEdits = opts?.inputPath
    ? parseEditFile({ filePath: opts.inputPath }, context) // allow users to pass a pre-written file, mostly for unit tests.
    : await promptForEdit(stack, context);
  await applyStackEdits(stackEdits, context);
}

export async function applyStackEdits(
  stackEdits: TStackEdit[],
  context: TContext
): Promise<void> {
  for (let i = 0; i < stackEdits.length; i++) {
    switch (stackEdits[i].type) {
      case 'pick':
        await applyStackEditPick(stackEdits[i], stackEdits.slice(i), context);
    }
  }
}

async function promptForEdit(stack: Stack, context: TContext) {
  const defaultEditor = await getDefaultEditorOrPrompt(context);
  return await performInTmpDir(async (tmpDir) => {
    const editFilePath = createStackEditFile({ stack, tmpDir }, context);
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
    return parseEditFile({ filePath: editFilePath }, context);
  });
}
