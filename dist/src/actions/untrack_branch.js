"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.untrackBranch = void 0;
const chalk_1 = __importDefault(require("chalk"));
const prompts_1 = __importDefault(require("prompts"));
const errors_1 = require("../lib/errors");
async function untrackBranch({ branchName, force }, context) {
    if (!context.metaCache.branchExists(branchName)) {
        throw new errors_1.ExitFailedError(`Branch ${chalk_1.default.yellow(branchName)} does not exist.`);
    }
    if (context.metaCache.isTrunk(branchName)) {
        throw new errors_1.ExitFailedError(`Can't untrack trunk!`);
    }
    if (!context.metaCache.isBranchTracked(branchName)) {
        context.splog.info(`Branch ${chalk_1.default.yellow(branchName)} is not tracked by Graphite.`);
        return;
    }
    const children = context.metaCache.getChildren(branchName);
    if (children.length) {
        context.splog.tip('If you would like to keep these branches tracked, use `upstack onto` to change their parent before untracking.');
        if (!(await shouldUntrackBranchWithChildren({ branchName, children, force }, context))) {
            return;
        }
    }
    context.metaCache.untrackBranch(branchName);
    context.splog.info(`Untracked branch ${chalk_1.default.yellow(branchName)}.`);
}
exports.untrackBranch = untrackBranch;
async function shouldUntrackBranchWithChildren({ branchName, children, force, }, context) {
    context.splog.info(`${chalk_1.default.yellow(branchName)} has tracked children:\n${children
        .map((child) => `▸ ${child}`)
        .join('\n')}`);
    return (force ||
        (context.interactive &&
            (await (0, prompts_1.default)({
                type: 'confirm',
                name: 'value',
                message: `Are you sure you want to untrack ${chalk_1.default.yellow(branchName)} and all of its upstack branches?`,
                initial: false,
            }, {
                onCancel: () => {
                    throw new errors_1.KilledError();
                },
            })).value));
}
//# sourceMappingURL=untrack_branch.js.map