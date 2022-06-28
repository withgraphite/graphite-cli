"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.editDownstack = void 0;
const scope_spec_1 = require("../../lib/engine/scope_spec");
const errors_1 = require("../../lib/errors");
const escape_for_shell_1 = require("../../lib/utils/escape_for_shell");
const exec_sync_1 = require("../../lib/utils/exec_sync");
const perform_in_tmp_dir_1 = require("../../lib/utils/perform_in_tmp_dir");
const restack_1 = require("../restack");
const stack_edit_file_1 = require("./stack_edit_file");
async function editDownstack(inputPath, context) {
    // First, reorder the parent pointers of the branches
    const branchNames = inputPath
        ? (0, stack_edit_file_1.parseEditFile)(inputPath) // allow users to pass a pre-written file, mostly for unit tests.
        : await promptForEdit(context);
    reorderBranches(context.metaCache.trunk, branchNames, context);
    // Restack starting from the bottom of the new stack upwards
    const branchesToRestack = context.metaCache.getRelativeStack(branchNames[0], scope_spec_1.SCOPE.UPSTACK);
    // We to check out the top of the new stack BEFORE we restack in case of conflicts.
    context.metaCache.checkoutBranch(branchNames.reverse()[0]);
    (0, restack_1.restackBranches)(branchesToRestack, context);
}
exports.editDownstack = editDownstack;
function reorderBranches(parentBranchName, branchNames, context) {
    if (branchNames.length === 0) {
        return;
    }
    context.metaCache.setParent(branchNames[0], parentBranchName);
    context.splog.debug(`Set parent of ${branchNames[0]} to ${parentBranchName}`);
    reorderBranches(branchNames[0], branchNames.slice(1), context);
}
async function promptForEdit(context) {
    const branchNames = context.metaCache.getRelativeStack(context.metaCache.currentBranchPrecondition, scope_spec_1.SCOPE.DOWNSTACK);
    return (0, perform_in_tmp_dir_1.performInTmpDir)((tmpDir) => {
        const editFilePath = (0, stack_edit_file_1.createStackEditFile)({ branchNames, tmpDir }, context);
        (0, exec_sync_1.gpExecSync)({
            command: `${context.userConfig.getEditor()} ${(0, escape_for_shell_1.q)(editFilePath)}`,
            options: { stdio: 'inherit' },
        }, (err) => {
            throw new errors_1.ExitFailedError('Failed to prompt for stack edit. Aborting...', err);
        });
        return (0, stack_edit_file_1.parseEditFile)(editFilePath);
    });
}
//# sourceMappingURL=edit_downstack.js.map