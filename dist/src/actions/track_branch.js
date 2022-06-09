"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.trackBranch = exports.trackBranchInteractive = void 0;
const chalk_1 = __importDefault(require("chalk"));
const prompts_1 = __importDefault(require("prompts"));
const errors_1 = require("../lib/errors");
async function trackBranchInteractive(parentBranchName, context) {
    if (!context.interactive) {
        throw new errors_1.ExitFailedError('Must provide a branch to track in non-interactive mode.');
    }
    const choices = context.metaCache.allBranchNames
        .filter((branchName) => !context.metaCache.isBranchTracked(branchName) &&
        context.metaCache.canTrackBranch(branchName, parentBranchName))
        .map((branchName) => ({ title: branchName, value: branchName }));
    if (!choices.length) {
        context.splog.info(`No branches available to track as children of ${chalk_1.default.blueBright(parentBranchName)}!`);
        return false;
    }
    const branchName = (await (0, prompts_1.default)({
        type: 'autocomplete',
        name: 'value',
        message: `Enter a branch to track as a child of ${parentBranchName} (autocomplete or arrow keys)`,
        choices,
        suggest: (input, choices) => choices.filter((c) => c.value.includes(input)),
    }, {
        onCancel: () => {
            throw new errors_1.KilledError();
        },
    })).value;
    if (!branchName) {
        throw new errors_1.KilledError();
    }
    trackBranchInternal({ branchName, parentBranchName }, context);
    return true;
}
exports.trackBranchInteractive = trackBranchInteractive;
async function trackBranch({ branchName, parentBranchName, force, }, context) {
    if (branchName &&
        !(await shouldTrackBranch({ branchName, parentBranchName, force }, context))) {
        return;
    }
    trackBranchInternal({ branchName, parentBranchName }, context);
}
exports.trackBranch = trackBranch;
function trackBranchInternal({ branchName, parentBranchName, }, context) {
    context.metaCache.trackBranch(branchName, parentBranchName);
    context.metaCache.checkoutBranch(branchName);
    context.splog.info(`Checked out newly tracked branch ${chalk_1.default.green(branchName)} with parent ${chalk_1.default.cyan(parentBranchName)}.`);
    return true;
}
async function shouldTrackBranch({ branchName, parentBranchName, force, }, context) {
    if (!context.metaCache.branchExists(branchName)) {
        throw new errors_1.ExitFailedError(`Branch ${chalk_1.default.yellow(branchName)} does not exist.`);
    }
    if (context.metaCache.isTrunk(branchName)) {
        throw new errors_1.ExitFailedError(`${chalk_1.default.yellow(branchName)} is designated as trunk. To change your configured trunk branch, use ${chalk_1.default.cyan(`gt repo init`)}.`);
    }
    if (context.metaCache.isBranchTracked(branchName) &&
        !(await shouldRetrackBranch({ branchName, parentBranchName, force }, context))) {
        return false;
    }
    if (!context.metaCache.canTrackBranch(branchName, parentBranchName)) {
        context.splog.tip(`Are you sure that ${chalk_1.default.cyan(parentBranchName)} is the right parent for ${chalk_1.default.cyan(branchName)}?  If so, you can fix its history with ${chalk_1.default.cyan(`git rebase ${parentBranchName} ${branchName}`)} and then try again.`);
        throw new errors_1.ExitFailedError(`${chalk_1.default.yellow(parentBranchName)} is not in the history of ${chalk_1.default.yellow(branchName)}.`);
    }
    return true;
}
async function shouldRetrackBranch({ branchName, parentBranchName, force, }, context) {
    context.splog.info(`Already tracking ${chalk_1.default.yellow(branchName)}.`);
    if (parentBranchName === context.metaCache.getParentPrecondition(branchName)) {
        context.splog.info(`Parent is already set to ${chalk_1.default.cyan(parentBranchName)}.`);
        return false;
    }
    context.splog.warn(`This operation may result in a duplicated commit history.`);
    context.splog.tip('Did you mean to use `gt upstack onto`?');
    return (force ||
        (context.interactive &&
            (await (0, prompts_1.default)({
                type: 'confirm',
                name: 'value',
                message: `Are you sure that you'd like to change its parent to ${chalk_1.default.yellow(parentBranchName)}?`,
                initial: false,
            }, {
                onCancel: () => {
                    throw new errors_1.KilledError();
                },
            })).value));
}
//# sourceMappingURL=track_branch.js.map