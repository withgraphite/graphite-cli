"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteBranchAction = void 0;
const errors_1 = require("../lib/errors");
const utils_1 = require("../lib/utils");
const wrapper_classes_1 = require("../wrapper-classes");
const branch_1 = require("../wrapper-classes/branch");
function deleteBranchAction(args, context) {
    var _a, _b;
    const trunk = utils_1.getTrunk(context).name;
    if (trunk === args.branchName) {
        throw new errors_1.ExitFailedError('Cannot delete trunk!');
    }
    const currentBranch = branch_1.Branch.getCurrentBranch();
    if ((currentBranch === null || currentBranch === void 0 ? void 0 : currentBranch.name) === args.branchName) {
        utils_1.checkoutBranch((_b = (_a = currentBranch.getParentFromMeta(context)) === null || _a === void 0 ? void 0 : _a.name) !== null && _b !== void 0 ? _b : trunk, {
            quiet: true,
        });
    }
    utils_1.gpExecSync({
        command: `git branch ${args.force ? '-D' : '-d'} ${args.branchName}`,
        options: { stdio: 'pipe' },
    }, (err) => {
        if ((currentBranch === null || currentBranch === void 0 ? void 0 : currentBranch.name) === args.branchName) {
            utils_1.checkoutBranch(currentBranch.name, {
                quiet: true,
            });
        }
        throw new errors_1.ExitFailedError([
            'Failed to delete branch. Aborting...',
            err.stderr
                .toString()
                .trim()
                .replace('git branch -D', 'gt branch delete -f'),
        ].join('\n'));
    });
    // No need for a try-catch here; this already silently does nothing if the
    // metadata does not exist.
    new wrapper_classes_1.MetadataRef(args.branchName).delete();
}
exports.deleteBranchAction = deleteBranchAction;
//# sourceMappingURL=delete_branch.js.map