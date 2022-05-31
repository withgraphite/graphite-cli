"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteBranchAction = void 0;
const chalk_1 = __importDefault(require("chalk"));
const errors_1 = require("../lib/errors");
const checkout_branch_1 = require("../lib/git/checkout_branch");
const current_branch_name_1 = require("../lib/git/current_branch_name");
const deleteBranch_1 = require("../lib/git/deleteBranch");
const trunk_1 = require("../lib/utils/trunk");
const branch_1 = require("../wrapper-classes/branch");
const metadata_ref_1 = require("../wrapper-classes/metadata_ref");
const clean_branches_1 = require("./clean_branches");
function deleteBranchAction(args, context) {
    var _a, _b;
    const trunk = trunk_1.getTrunk(context).name;
    if (trunk === args.branchName) {
        throw new errors_1.ExitFailedError('Cannot delete trunk!');
    }
    const current = current_branch_name_1.currentBranchName();
    if (!args.force &&
        !clean_branches_1.mergedBaseIfMerged(branch_1.Branch.branchWithName(args.branchName), context)) {
        throw new errors_1.ExitFailedError(`The branch ${args.branchName} is not fully merged.  Use the \`--force\` option to delete it.`);
    }
    if (current === args.branchName) {
        checkout_branch_1.checkoutBranch((_b = (_a = branch_1.Branch.branchWithName(current).getParentFromMeta(context)) === null || _a === void 0 ? void 0 : _a.name) !== null && _b !== void 0 ? _b : trunk, {
            quiet: true,
        });
    }
    deleteBranch_1.deleteBranch(args.branchName);
    context.splog.logInfo(`Deleted branch ${chalk_1.default.red(args.branchName)}`);
    // No need for a try-catch here; this already silently does nothing if the
    // metadata does not exist.
    new metadata_ref_1.MetadataRef(args.branchName).delete();
}
exports.deleteBranchAction = deleteBranchAction;
//# sourceMappingURL=delete_branch.js.map