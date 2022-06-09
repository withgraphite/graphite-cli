"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.renameCurrentBranch = void 0;
const chalk_1 = __importDefault(require("chalk"));
const errors_1 = require("../lib/errors");
const branch_name_1 = require("../lib/utils/branch_name");
function renameCurrentBranch(args, context) {
    const oldBranchName = context.metaCache.currentBranchPrecondition;
    if (context.metaCache.getPrInfo(oldBranchName)?.number && !args.force) {
        context.splog.tip(`Renaming a branch that is already associated with a PR removes the association.`);
        throw new errors_1.ExitFailedError('Renaming a branch for a submitted PR requires the `--force` option');
    }
    const newBranchName = (0, branch_name_1.replaceUnsupportedCharacters)(args.newBranchName, context);
    context.metaCache.renameCurrentBranch(newBranchName);
    context.splog.info(`Successfully renamed ${chalk_1.default.blueBright(oldBranchName)} to ${chalk_1.default.green(newBranchName)}`);
}
exports.renameCurrentBranch = renameCurrentBranch;
//# sourceMappingURL=rename_branch.js.map