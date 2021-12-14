"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteBranchAction = void 0;
const errors_1 = require("../lib/errors");
const utils_1 = require("../lib/utils");
const wrapper_classes_1 = require("../wrapper-classes");
function deleteBranchAction(args) {
    const meta = new wrapper_classes_1.MetadataRef(args.branchName);
    // No need for a try-catch here; this already silently does nothing if the
    // metadata does not exist.
    meta.delete();
    (0, utils_1.gpExecSync)({
        command: `git branch ${args.force ? '-D' : '-d'} ${args.branchName}`,
    }, (err) => {
        throw new errors_1.ExitFailedError('Failed to delete branch. Aborting...', err);
    });
}
exports.deleteBranchAction = deleteBranchAction;
//# sourceMappingURL=delete_branch.js.map