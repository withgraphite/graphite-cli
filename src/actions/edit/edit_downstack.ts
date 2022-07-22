import { TContext } from '../../lib/context';
import { SCOPE } from '../../lib/engine/scope_spec';
import { performInTmpDir } from '../../lib/utils/perform_in_tmp_dir';
import { restackBranches } from '../restack';
import { createStackEditFile, parseEditFile } from './stack_edit_file';

export async function editDownstack(
  inputPath: string | undefined,
  context: TContext
): Promise<void> {
  // First, reorder the parent pointers of the branches
  const branchNames = inputPath
    ? parseEditFile(inputPath) // allow users to pass a pre-written file, mostly for unit tests.
    : await promptForEdit(context);
  reorderBranches(context.metaCache.trunk, branchNames, context);

  // Restack starting from the bottom of the new stack upwards
  const branchesToRestack = context.metaCache.getRelativeStack(
    branchNames[0],
    SCOPE.UPSTACK
  );

  // We to check out the top of the new stack BEFORE we restack in case of conflicts.
  context.metaCache.checkoutBranch(branchNames.reverse()[0]);
  restackBranches(branchesToRestack, context);
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
  context.splog.debug(`Set parent of ${branchNames[0]} to ${parentBranchName}`);
  reorderBranches(branchNames[0], branchNames.slice(1), context);
}

async function promptForEdit(context: TContext): Promise<string[]> {
  const branchNames = context.metaCache.getRelativeStack(
    context.metaCache.currentBranchPrecondition,
    SCOPE.DOWNSTACK
  );
  return performInTmpDir((tmpDir) => {
    const editFilePath = createStackEditFile({ branchNames, tmpDir }, context);
    context.userConfig.execEditor(editFilePath);
    return parseEditFile(editFilePath);
  });
}
