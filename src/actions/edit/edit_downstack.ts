import { TContext } from '../../lib/context/context';
import { ExitFailedError } from '../../lib/errors';
import { currentBranchPrecondition } from '../../lib/preconditions';
import { assertUnreachable } from '../../lib/utils/assert_unreachable';
import { checkoutBranch } from '../../lib/utils/checkout_branch';
import { getDefaultEditorOrPrompt } from '../../lib/utils/default_editor';
import { gpExecSync } from '../../lib/utils/exec_sync';
import { performInTmpDir } from '../../lib/utils/perform_in_tmp_dir';
import { getTrunk } from '../../lib/utils/trunk';
import { MetaStackBuilder } from '../../wrapper-classes';
import { Stack } from '../../wrapper-classes/stack';
import { validate } from '../validate';
import { applyStackEditExec, applyStackEditPick } from './apply_stack_edit';
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
  validate('DOWNSTACK', context);

  const currentBranch = currentBranchPrecondition(context);
  const stack = new MetaStackBuilder().downstackFromBranch(
    currentBranch,
    context
  );
  const stackEdits = opts?.inputPath
    ? parseEditFile({ filePath: opts.inputPath }, context) // allow users to pass a pre-written file, mostly for unit tests.
    : await promptForEdit(stack, context);
  applyStackEdits(getTrunk(context).name, stackEdits, context);
}

export function applyStackEdits(
  fromBranchName: string,
  stackEdits: TStackEdit[],
  context: TContext
): void {
  checkoutBranch(fromBranchName, { quiet: true });
  stackEdits.forEach((stackEdit, index) => {
    switch (stackEdit.type) {
      case 'pick':
        applyStackEditPick(
          {
            branchName: stackEdit.branchName,
            remainingEdits: stackEdits.slice(index),
          },
          context
        );
        break;
      case 'exec':
        applyStackEditExec(
          {
            command: stackEdit.command,
            remainingEdits: stackEdits.slice(index),
          },
          context
        );
        break;
      default:
        assertUnreachable(stackEdit);
        break;
    }
  });
}

async function promptForEdit(
  stack: Stack,
  context: TContext
): Promise<TStackEdit[]> {
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
    return parseEditFile({ filePath: editFilePath }, context);
  });
}
