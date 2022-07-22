"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.renameCurrentBranch = void 0;
const chalk_1 = __importDefault(require("chalk"));
const prompts_1 = __importDefault(require("prompts"));
const errors_1 = require("../lib/errors");
const branch_name_1 = require("../lib/utils/branch_name");
async function getNewBranchName(context, oldBranchName) {
    context.splog.info(`Enter new name for ${chalk_1.default.blueBright(oldBranchName)}:`);
    const response = await (0, prompts_1.default)({
        type: 'text',
        name: 'branchName',
        message: 'Branch Name',
        initial: oldBranchName,
        validate: (name) => {
            const calculatedName = (0, branch_name_1.replaceUnsupportedCharacters)(name, context);
            return oldBranchName !== calculatedName &&
                context.metaCache.allBranchNames.includes(calculatedName)
                ? 'Branch name is unavailable.'
                : true;
        },
    }, {
        onCancel: () => {
            throw new errors_1.KilledError();
        },
    });
    return response.branchName;
}
async function renameCurrentBranch(args, context) {
    const oldBranchName = context.metaCache.currentBranchPrecondition;
    const branchName = context.interactive && args.newBranchName
        ? args.newBranchName
        : await getNewBranchName(context, oldBranchName);
    if (oldBranchName === branchName) {
        context.splog.info(`Current branch is already named ${chalk_1.default.cyan(oldBranchName)}`);
        return;
    }
    if (context.metaCache.getPrInfo(oldBranchName)?.number && !args.force) {
        context.splog.tip(`Renaming a branch that is already associated with a PR removes the association.`);
        throw new errors_1.ExitFailedError('Renaming a branch for a submitted PR requires the `--force` option');
    }
    const newBranchName = (0, branch_name_1.replaceUnsupportedCharacters)(branchName, context);
    context.metaCache.renameCurrentBranch(newBranchName);
    context.splog.info(`Successfully renamed ${chalk_1.default.blueBright(oldBranchName)} to ${chalk_1.default.green(newBranchName)}`);
}
exports.renameCurrentBranch = renameCurrentBranch;
//# sourceMappingURL=rename_branch.js.map