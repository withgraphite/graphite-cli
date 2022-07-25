"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBranchesFromRemote = exports.getAction = void 0;
const chalk_1 = __importDefault(require("chalk"));
const prompts_1 = __importDefault(require("prompts"));
const get_downstack_dependencies_1 = require("../../lib/api/get_downstack_dependencies");
const errors_1 = require("../../lib/errors");
const preconditions_1 = require("../../lib/preconditions");
const assert_unreachable_1 = require("../../lib/utils/assert_unreachable");
const persist_continuation_1 = require("../persist_continuation");
const print_conflict_status_1 = require("../print_conflict_status");
const sync_pr_info_1 = require("../sync_pr_info");
async function getAction(args, context) {
    (0, preconditions_1.uncommittedTrackedChangesPrecondition)();
    context.splog.info(`Pulling ${chalk_1.default.cyan(context.metaCache.trunk)} from remote...`);
    context.splog.info(context.metaCache.pullTrunk() === 'PULL_UNNEEDED'
        ? `${chalk_1.default.green(context.metaCache.trunk)} is up to date.`
        : `${chalk_1.default.green(context.metaCache.trunk)} fast-forwarded to ${chalk_1.default.gray(context.metaCache.getRevision(context.metaCache.trunk))}.`);
    context.splog.newline();
    const authToken = (0, preconditions_1.cliAuthPrecondition)(context);
    const downstackToSync = await (0, get_downstack_dependencies_1.getDownstackDependencies)({
        branchName: args.branchName ?? context.metaCache.currentBranchPrecondition,
        trunkName: context.metaCache.trunk,
    }, {
        authToken,
        repoName: context.repoConfig.getRepoName(),
        repoOwner: context.repoConfig.getRepoOwner(),
    });
    await getBranchesFromRemote({
        downstack: downstackToSync,
        base: context.metaCache.trunk,
        force: args.force,
    }, context);
    await (0, sync_pr_info_1.syncPrInfo)(context.metaCache.allBranchNames, context);
}
exports.getAction = getAction;
async function getBranchesFromRemote(args, context) {
    let parentBranchName = args.base;
    for (const [index, branchName] of args.downstack.entries()) {
        context.metaCache.fetchBranch(branchName, parentBranchName);
        if (args.force || !context.metaCache.branchExists(branchName)) {
            context.metaCache.checkoutBranchFromFetched(branchName, parentBranchName);
            context.splog.info(`Synced ${chalk_1.default.cyan(branchName)} from remote.`);
        }
        else if (!context.metaCache.isBranchTracked(branchName)) {
            await handleUntrackedLocally(branchName, parentBranchName, context);
        }
        else if (context.metaCache.getParentPrecondition(branchName) !== parentBranchName) {
            await handleDifferentParents(branchName, parentBranchName, context);
        }
        else if (context.metaCache.branchMatchesFetched(branchName)) {
            context.splog.info(`${chalk_1.default.cyan(branchName)} is up to date.`);
        }
        else {
            const remainingBranchesToSync = args.downstack.slice(index + 1);
            await handleSameParent({ branchName, parentBranchName, remainingBranchesToSync }, context);
        }
        parentBranchName = branchName;
    }
}
exports.getBranchesFromRemote = getBranchesFromRemote;
async function handleUntrackedLocally(branchName, parentBranchName, context) {
    context.splog.info([
        `${chalk_1.default.yellow(branchName)} shares a name with a local branch that not tracked by Graphite.`,
        `In order to sync it, you must overwrite your local copy of the branch.`,
        `If you do not wish to overwrite your copy, the command will be aborted.`,
    ].join('\n'));
    await maybeOverwriteBranch(branchName, parentBranchName, context);
}
async function handleDifferentParents(branchName, parentBranchName, context) {
    context.splog.info([
        `${chalk_1.default.yellow(branchName)} shares a name with a local branch, but they have different parents.`,
        `In order to sync it, you must overwrite your local copy of the branch.`,
        `If you do not wish to overwrite your copy, the command will be aborted.`,
    ].join('\n'));
    await maybeOverwriteBranch(branchName, parentBranchName, context);
}
// Helper function for cases where we can either overwrite local or abort
async function maybeOverwriteBranch(branchName, parentBranchName, context) {
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
// This is the most complex case - if the branch's parent matches meta,
// we need to not only allow for overwrite and abort, but also rebasing
// local changes onto the changes from remote.
async function handleSameParent(args, context) {
    context.splog.info([
        `${chalk_1.default.yellow(args.branchName)} shares a name with a local branch, and they have the same parent.`,
        `You can either overwrite your copy of the branch, or rebase your local changes onto the remote version.`,
        `You can also abort the command entirely and keep your local state as is.`,
    ].join('\n'));
    const fetchChoice = !context.interactive
        ? 'ABORT'
        : (await (0, prompts_1.default)({
            type: 'select',
            name: 'value',
            message: `How would you like to handle ${chalk_1.default.yellow(args.branchName)}?`,
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
        case 'REBASE': {
            const result = context.metaCache.rebaseBranchOntoFetched(args.branchName, args.parentBranchName);
            if (result.result === 'REBASE_CONFLICT') {
                (0, persist_continuation_1.persistContinuation)({
                    branchesToSync: args.remainingBranchesToSync,
                    rebasedBranchBase: result.rebasedBranchBase,
                }, context);
                (0, print_conflict_status_1.printConflictStatus)(`Hit conflict rebasing ${chalk_1.default.yellow(args.branchName)} onto remote source of truth.`, context);
                throw new errors_1.RebaseConflictError();
            }
            context.splog.info(`Rebased local changes to ${chalk_1.default.cyan(args.branchName)} onto remote source of truth.`);
            context.splog.tip(`If this branch has local children, they likely need to be restacked.`);
            break;
        }
        case 'OVERWRITE':
            context.metaCache.checkoutBranchFromFetched(args.branchName, args.parentBranchName);
            context.splog.info(`Synced ${chalk_1.default.cyan(args.branchName)} from remote.`);
            break;
        case 'ABORT':
            throw new errors_1.KilledError();
        default:
            (0, assert_unreachable_1.assertUnreachable)(fetchChoice);
    }
}
//# sourceMappingURL=get.js.map