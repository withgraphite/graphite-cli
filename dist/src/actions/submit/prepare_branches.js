"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPRInfoForBranches = void 0;
const chalk_1 = __importDefault(require("chalk"));
const prompts_1 = __importDefault(require("prompts"));
const diff_1 = require("../../lib/git/diff");
const pr_body_1 = require("./pr_body");
const pr_draft_1 = require("./pr_draft");
const pr_title_1 = require("./pr_title");
const reviewers_1 = require("./reviewers");
/**
 * For now, we only allow users to update the following PR properties which
 * necessitate a PR update:
 * - the PR base
 * - the PR's code contents
 *
 * Notably, we do not yet allow users to update the PR title, body, etc.
 *
 * Therefore, we should only update the PR iff either of these properties
 * differ from our stored data on the previous PR submission.
 */
async function getPRInfoForBranches(args, context) {
    const prActions = [];
    for await (const branchName of args.branchNames) {
        const action = await getPRAction({
            branchName,
            updateOnly: args.updateOnly,
            draft: args.draft,
            publish: args.publish,
            dryRun: args.dryRun,
            select: args.select,
        }, context);
        if (action) {
            prActions.push(action);
        }
    }
    const submissionInfo = [];
    for await (const action of prActions) {
        const parentBranchName = context.metaCache.getParentPrecondition(action.branchName);
        submissionInfo.push({
            head: action.branchName,
            headSha: context.metaCache.getRevision(action.branchName),
            base: parentBranchName,
            baseSha: context.metaCache.getRevision(parentBranchName),
            ...(action.update
                ? {
                    action: 'update',
                    prNumber: action.prNumber,
                    draft: args.draft ? true : args.publish ? false : undefined,
                }
                : {
                    action: 'create',
                    ...(await getPRCreationInfo({
                        branchName: action.branchName,
                        editPRFieldsInline: args.editPRFieldsInline,
                        draft: args.draft,
                        publish: args.publish,
                        reviewers: args.reviewers,
                    }, context)),
                }),
        });
    }
    context.splog.newline();
    return submissionInfo;
}
exports.getPRInfoForBranches = getPRInfoForBranches;
async function getPRAction(args, context) {
    // The branch here should always have a parent - above, the branches we've
    // gathered should exclude trunk which ensures that every branch we're submitting
    // a PR for has a valid parent.
    const parentBranchName = context.metaCache.getParentPrecondition(args.branchName);
    const prInfo = context.metaCache.getPrInfo(args.branchName);
    const prNumber = prInfo?.number;
    const calculatedStatus = prNumber === undefined
        ? args.updateOnly
            ? 'NOOP'
            : 'CREATE'
        : parentBranchName !== prInfo?.base
            ? 'RESTACK'
            : (0, diff_1.detectUnsubmittedChanges)(args.branchName, context.repoConfig.getRemote())
                ? 'CHANGE'
                : args.draft === true && prInfo.isDraft !== true
                    ? 'DRAFT'
                    : args.publish === true && prInfo.isDraft !== false
                        ? 'PUBLISH'
                        : 'NOOP';
    const status = !args.select ||
        calculatedStatus === 'NOOP' ||
        (await selectBranch(args.branchName))
        ? calculatedStatus
        : 'NOOP';
    context.splog.info({
        NOOP: `▸ ${chalk_1.default.gray(args.branchName)} (No-op)`,
        CREATE: `▸ ${chalk_1.default.cyan(args.branchName)} (Create)`,
        RESTACK: `▸ ${chalk_1.default.cyan(args.branchName)} (New parent)`,
        CHANGE: `▸ ${chalk_1.default.cyan(args.branchName)} (Update)`,
        DRAFT: `▸ ${chalk_1.default.blueBright(args.branchName)} (Mark as draft)`,
        PUBLISH: `▸ ${chalk_1.default.blueBright(args.branchName)} (Ready for review)`,
    }[status]);
    return args.dryRun || status === 'NOOP'
        ? undefined
        : {
            branchName: args.branchName,
            ...(prNumber === undefined
                ? { update: false }
                : { update: true, prNumber }),
        };
}
async function selectBranch(branchName) {
    const result = (await (0, prompts_1.default)({
        name: 'value',
        initial: true,
        type: 'confirm',
        message: `Would you like to submit ${chalk_1.default.cyan(branchName)}?`,
    })).value;
    // Clear the prompt result
    process.stdout.moveCursor(0, -1);
    process.stdout.clearLine(1);
    return result;
}
async function getPRCreationInfo(args, context) {
    if (args.editPRFieldsInline) {
        context.splog.newline();
        context.splog.info(`Enter info for new pull request for ${chalk_1.default.cyan(args.branchName)} ▸ ${chalk_1.default.blueBright(context.metaCache.getParentPrecondition(args.branchName))}:`);
    }
    const submitInfo = {};
    try {
        submitInfo.title = await (0, pr_title_1.getPRTitle)({
            branchName: args.branchName,
            editPRFieldsInline: args.editPRFieldsInline,
        }, context);
        submitInfo.body = await (0, pr_body_1.getPRBody)({
            branchName: args.branchName,
            editPRFieldsInline: args.editPRFieldsInline,
        }, context);
    }
    finally {
        // Save locally in case this command fails
        context.metaCache.upsertPrInfo(args.branchName, submitInfo);
    }
    const reviewers = await (0, reviewers_1.getReviewers)({
        fetchReviewers: args.reviewers,
    });
    const createAsDraft = args.publish
        ? false
        : args.draft || !args.editPRFieldsInline
            ? true
            : await (0, pr_draft_1.getPRDraftStatus)(context);
    return {
        title: submitInfo.title,
        body: submitInfo.body,
        reviewers,
        draft: createAsDraft,
    };
}
//# sourceMappingURL=prepare_branches.js.map