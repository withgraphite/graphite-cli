"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.trackBranch = exports.trackBranchInteractive = void 0;
const chalk_1 = __importDefault(require("chalk"));
const prompts_1 = __importDefault(require("prompts"));
const errors_1 = require("../lib/errors");
const checkout_branch_1 = require("./checkout_branch");
async function trackBranchInteractive(context) {
    const parentBranchName = context.metaCache.currentBranchPrecondition;
    const choices = context.metaCache.allBranchNames
        .filter((branchName) => !context.metaCache.isBranchTracked(branchName) &&
        context.metaCache.isViableParent(branchName, parentBranchName))
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
    trackHelper({ branchName, parentBranchName }, context);
    await (0, checkout_branch_1.checkoutBranch)(branchName, context);
    return true;
}
exports.trackBranchInteractive = trackBranchInteractive;
async function trackBranch(args, context) {
    const branchName = args.branchName ?? context.metaCache.currentBranch;
    if (!context.metaCache.branchExists(branchName)) {
        throw new errors_1.ExitFailedError(`No branch found.`);
    }
    if (!args.parentBranchName) {
        const choices = context.metaCache.allBranchNames
            .filter((b) => (context.metaCache.isTrunk(b) ||
            context.metaCache.isBranchTracked(b)) &&
            context.metaCache.isViableParent(branchName, b))
            .map((b) => {
            return { title: b, value: b };
        });
        if (choices.length === 0) {
            throw new errors_1.ExitFailedError(`No possible parents for this branch. Try running \`git rebase ${context.metaCache.trunk} ${branchName}\``);
        }
        if (choices.length === 1) {
            trackHelper({ branchName, parentBranchName: choices[0].value }, context);
            return;
        }
        if (!context.interactive) {
            throw new errors_1.ExitFailedError(`Multiple possible parents; cannot prompt in non-interactive mode.`);
        }
        trackHelper({
            branchName,
            parentBranchName: (await (0, prompts_1.default)({
                type: 'autocomplete',
                name: 'branch',
                message: `Select a parent for ${branchName} (autocomplete or arrow keys)`,
                choices,
                suggest: (input, choices) => choices.filter((c) => c.value.includes(input)),
            })).branch,
        }, context);
        return;
    }
    if (!context.metaCache.isViableParent(branchName, args.parentBranchName)) {
        context.splog.tip(`Are you sure that ${chalk_1.default.cyan(args.parentBranchName)} is the right parent for ${chalk_1.default.cyan(branchName)}?  If so, you can fix its history with ${chalk_1.default.cyan(`git rebase ${args.parentBranchName} ${branchName}`)} and then try again.`);
        throw new errors_1.ExitFailedError(`${chalk_1.default.yellow(args.parentBranchName)} is not in the history of ${chalk_1.default.yellow(branchName)}.`);
    }
    trackHelper({ branchName, parentBranchName: args.parentBranchName }, context);
}
exports.trackBranch = trackBranch;
function trackHelper({ branchName, parentBranchName, }, context) {
    context.metaCache.trackBranch(branchName, parentBranchName);
    context.splog.info(`Tracked branch ${chalk_1.default.green(branchName)} with parent ${chalk_1.default.cyan(parentBranchName)}.`);
}
//# sourceMappingURL=track_branch.js.map