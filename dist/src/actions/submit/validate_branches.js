"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateNoEmptyBranches = exports.validateBranchesToSubmit = void 0;
const chalk_1 = __importDefault(require("chalk"));
const prompts_1 = __importDefault(require("prompts"));
const errors_1 = require("../../lib/errors");
const sync_pr_info_1 = require("../sync_pr_info");
async function validateBranchesToSubmit(branchNames, context) {
    context.splog.info(chalk_1.default.blueBright(`✏️  Validating that this Graphite stack is ready to submit...`));
    context.splog.newline();
    await (0, sync_pr_info_1.syncPrInfo)(branchNames, context);
    validateNoMergedOrClosedBranches(branchNames, context);
    await validateNoEmptyBranches(branchNames, context);
    validateBaseRevisions(branchNames, context);
    return branchNames;
}
exports.validateBranchesToSubmit = validateBranchesToSubmit;
function validateNoMergedOrClosedBranches(branchNames, context) {
    const mergedOrClosedBranches = branchNames.filter((b) => ['MERGED', 'CLOSED'].includes(context.metaCache.getPrInfo(b)?.state ?? ''));
    if (mergedOrClosedBranches.length === 0) {
        return;
    }
    const hasMultipleBranches = mergedOrClosedBranches.length > 1;
    context.splog.tip('You can use `gt repo sync` to find and delete all merged/closed branches automatically and rebase their children.');
    throw new errors_1.ExitFailedError([
        `PR${hasMultipleBranches ? 's' : ''} for the following branch${hasMultipleBranches ? 'es have' : ' has'} already been merged or closed:`,
        ...mergedOrClosedBranches.map((b) => `▸ ${chalk_1.default.reset(b)}`),
    ].join('\n'));
}
// We want to ensure that for each branch, either:
// 1. Its parent is trunk
// 2. We are submitting its parent before it and it does not need restacking
// 3. Its base matches the existing head for its parent's PR
function validateBaseRevisions(branchNames, context) {
    const validatedBranches = new Set();
    for (const branchName of branchNames) {
        const parentBranchName = context.metaCache.getParentPrecondition(branchName);
        if (context.metaCache.isTrunk(parentBranchName)) {
            // valid
        }
        else if (validatedBranches.has(parentBranchName)) {
            if (!context.metaCache.isBranchFixed(branchName)) {
                throw new errors_1.ExitFailedError([
                    `You are trying to submit at least one branch that has not been restacked.`,
                    `Please restack upstack from ${chalk_1.default.yellow(branchName)} and try again.`,
                ].join('\n'));
            }
        }
        else {
            if (!context.metaCache.baseMatchesRemoteParent(branchName)) {
                throw new errors_1.ExitFailedError([
                    `You are trying to submit at least one branch whose base does not match its parent remotely, without including its parent.`,
                    `Please include downstack from ${chalk_1.default.yellow(branchName)} in your submit scope and try again.`,
                ].join('\n'));
            }
        }
        validatedBranches.add(branchName);
    }
}
async function validateNoEmptyBranches(branchNames, context) {
    const emptyBranches = branchNames.filter(context.metaCache.isBranchEmpty);
    if (emptyBranches.length === 0) {
        return;
    }
    const hasMultipleBranches = emptyBranches.length > 1;
    context.splog.warn(`The following branch${hasMultipleBranches ? 'es have' : ' has'} no changes:`);
    emptyBranches.forEach((b) => context.splog.warn(`▸ ${chalk_1.default.reset(b)}`));
    context.splog.warn(`Are you sure you want to submit ${hasMultipleBranches ? 'them' : 'it'}?`);
    context.splog.newline();
    if (!context.interactive) {
        throw new errors_1.ExitFailedError(`Aborting non-interactive submit.`);
    }
    const response = await (0, prompts_1.default)({
        type: 'select',
        name: 'empty_branches_options',
        message: `How would you like to proceed?`,
        choices: [
            {
                title: `Abort command and keep working on ${hasMultipleBranches ? 'these branches' : 'this branch'}`,
                value: 'abort',
            },
            {
                title: `Continue with empty branch${hasMultipleBranches ? 'es' : ''}`,
                value: 'continue',
            },
        ],
    }, {
        onCancel: () => {
            throw new errors_1.KilledError();
        },
    });
    if (response.empty_branches_options.abort) {
        throw new errors_1.KilledError();
    }
    context.splog.newline();
}
exports.validateNoEmptyBranches = validateNoEmptyBranches;
//# sourceMappingURL=validate_branches.js.map