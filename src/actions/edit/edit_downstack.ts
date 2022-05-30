import { TContext } from '../../lib/context';
import { ExitFailedError } from '../../lib/errors';
import { SCOPE } from '../../lib/state/scope_spec';
import { getDefaultEditorOrPrompt } from '../../lib/utils/default_editor';
import { gpExecSync } from '../../lib/utils/exec_sync';
import { performInTmpDir } from '../../lib/utils/perform_in_tmp_dir';
import { restackBranches } from '../restack';
import { createStackEditFile, parseEditFile } from './stack_edit_file';

export async function editDownstack(
  inputPath: string | undefined,
  context: TContext
): Promise<void> {
  const branchNames = inputPath
    ? parseEditFile(inputPath) // allow users to pass a pre-written file, mostly for unit tests.
    : await promptForEdit(context);
  reorderBranches(context.metaCache.trunk, branchNames, context);
  context.metaCache.checkoutBranch(branchNames.reverse()[0]);
  restackBranches({ relative: true, scope: SCOPE.STACK }, context);
}

function reorderBranches(
  parentBranchName: string,
  branchNames: string[],
  context: TContext
): void {
  if (branchNames.length === 0) {
    return;
  }
  context.metaCache.setParent(branchNames[0], parentBranchName);
  context.splog.logDebug(
    `Set parent of ${branchNames[0]} to ${parentBranchName}`
  );
  reorderBranches(branchNames[0], branchNames.slice(1), context);
}

async function promptForEdit(context: TContext): Promise<string[]> {
  const branchNames = context.metaCache.getRelativeStack(
    context.metaCache.currentBranchPrecondition,
    SCOPE.DOWNSTACK
  );
  const defaultEditor = await getDefaultEditorOrPrompt(context);
  return performInTmpDir((tmpDir) => {
    const editFilePath = createStackEditFile({ branchNames, tmpDir });
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
