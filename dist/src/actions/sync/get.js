"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAction = void 0;
const chalk_1 = __importDefault(require("chalk"));
const prompts_1 = __importDefault(require("prompts"));
const get_downstack_dependencies_1 = require("../../lib/api/get_downstack_dependencies");
const errors_1 = require("../../lib/errors");
const preconditions_1 = require("../../lib/preconditions");
const assert_unreachable_1 = require("../../lib/utils/assert_unreachable");
const sync_pr_info_1 = require("../sync_pr_info");
async function getAction(branchName, context) {
    (0, preconditions_1.uncommittedTrackedChangesPrecondition)();
    context.splog.info(`Pulling ${chalk_1.default.cyan(context.metaCache.trunk)} from remote...`);
    try {
        context.splog.info(context.metaCache.pullTrunk() === 'PULL_UNNEEDED'
            ? `${chalk_1.default.green(context.metaCache.trunk)} is up to date.`
            : `${chalk_1.default.green(context.metaCache.trunk)} fast-forwarded to ${chalk_1.default.gray(context.metaCache.getRevision(context.metaCache.trunk))}.`);
        context.splog.newline();
    }
    catch (err) {
        throw new errors_1.ExitFailedError(`Failed to pull trunk`, err);
    }
    const authToken = (0, preconditions_1.cliAuthPrecondition)(context);
    const downstackToSync = await (0, get_downstack_dependencies_1.getDownstackDependencies)({ branchName, trunkName: context.metaCache.trunk }, {
        authToken,
        repoName: context.repoConfig.getRepoName(),
        repoOwner: context.repoConfig.getRepoOwner(),
    });
    await getBranchesFromRemote(downstackToSync, context.metaCache.trunk, context);
    await (0, sync_pr_info_1.syncPrInfo)(context.metaCache.allBranchNames, context);
}
exports.getAction = getAction;
async function getBranchesFromRemote(downstack, base, context) {
    let parentBranchName = base;
    for (const branchName of downstack) {
        context.metaCache.fetchBranch(branchName, parentBranchName);
        if (!context.metaCache.branchExists(branchName)) {
            // If the branch doesn't already exists, no conflict to resolve
            context.metaCache.checkoutBranchFromFetched(branchName, parentBranchName);
            context.splog.info(`Synced ${chalk_1.default.cyan(branchName)} from remote.`);
        }
        else if (context.metaCache.getParentPrecondition(branchName) !== parentBranchName) {
            await handleDifferentParents(branchName, parentBranchName, context);
        }
        else if (context.metaCache.branchMatchesFetched(branchName)) {
            context.splog.info(`${chalk_1.default.cyan(branchName)} is up to date.`);
        }
        else {
            await handleSameParent(branchName, parentBranchName, context);
        }
        parentBranchName = branchName;
    }
}
async function handleDifferentParents(branchName, parentBranchName, context) {
    context.splog.info([
        `${chalk_1.default.yellow(branchName)} shares a name with a local branch, but they have different parents.`,
        `In order to sync it, you must overwrite your local copy of the branch.`,
        `If you do not wish to overwrite your copy, the command will be aborted.`,
    ].join('\n'));
    if (!context.interactive ||
        !(await (0, prompts_1.default)({
            type: 'confirm',
            name: 'value',
            message: `Overwrite ${chalk_1.default.yellow(branchName)} with the version from remote?`,
            initial: false,
        }, {
            onCancel: () => {
                throw new errors_1.KilledError();
            },
        })).value) {
        throw new errors_1.KilledError();
    }
    context.metaCache.checkoutBranchFromFetched(branchName, parentBranchName);
    context.splog.info(`Synced ${chalk_1.default.cyan(branchName)} from remote.`);
}
async function handleSameParent(branchName, parentBranchName, context) {
    context.splog.info([
        `${chalk_1.default.yellow(branchName)} shares a name with a local branch, and they have the same parent.`,
        `You can either overwrite your copy of the branch, or rebase your local changes onto the remote version.`,
        `You can also abort the command entirely and keep your local state as is.`,
    ].join('\n'));
    const fetchChoice = !context.interactive
        ? 'ABORT'
        : (await (0, prompts_1.default)({
            type: 'select',
            name: 'value',
            message: `How would you like to handle ${chalk_1.default.yellow(branchName)}?`,
            choices: [
                {
                    title: 'Rebase your changes on top of the remote version',
                    value: 'REBASE',
                },
                {
                    title: 'Overwrite the local copy with the remote version',
                    value: 'OVERWRITE',
                },
                { title: 'Abort this command', value: 'ABORT' },
            ],
        }, {
            onCancel: () => {
                throw new errors_1.KilledError();
            },
        })).value;
    switch (fetchChoice) {
        case 'REBASE':
            throw new errors_1.ExitFailedError(`Rebasing is not yet implemented.`);
        case 'OVERWRITE':
            context.metaCache.checkoutBranchFromFetched(branchName, parentBranchName);
            context.splog.info(`Synced ${chalk_1.default.cyan(branchName)} from remote.`);
            break;
        case 'ABORT':
            throw new errors_1.KilledError();
        default:
            (0, assert_unreachable_1.assertUnreachable)(fetchChoice);
    }
}
//# sourceMappingURL=get.js.map