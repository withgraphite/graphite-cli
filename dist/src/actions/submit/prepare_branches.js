"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPRInfoForBranches = void 0;
const chalk_1 = __importDefault(require("chalk"));
const detect_unsubmitted_changes_1 = require("../../lib/git/detect_unsubmitted_changes");
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
    context.splog.info(chalk_1.default.blueBright('🥞 Preparing to submit PRs for the following branches...'));
    const branchActions = args.branchNames
        .map((branchName) => getPRAction({
        branchName,
        updateOnly: args.updateOnly,
        draftToggle: args.draftToggle,
        dryRun: args.dryRun,
    }, context))
        .filter((action) => action !== undefined);
    const submissionInfo = [];
    for await (const action of branchActions) {
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
                    draft: args.draftToggle,
                }
                : {
                    action: 'create',
                    ...(await getPRCreationInfo({
                        branchName: action.branchName,
                        editPRFieldsInline: args.editPRFieldsInline,
                        draftToggle: args.draftToggle,
                        reviewers: args.reviewers,
                    }, context)),
                }),
        });
    }
    context.splog.newline();
    return submissionInfo;
}
exports.getPRInfoForBranches = getPRInfoForBranches;
function getPRAction(args, context) {
    // The branch here should always have a parent - above, the branches we've
    // gathered should exclude trunk which ensures that every branch we're submitting
    // a PR for has a valid parent.
    const parentBranchName = context.metaCache.getParentPrecondition(args.branchName);
    const prInfo = context.metaCache.getPrInfo(args.branchName);
    const prNumber = prInfo?.number;
    const status = prNumber === undefined
        ? args.updateOnly
            ? 'NOOP'
            : 'CREATE'
        : parentBranchName !== prInfo?.base
            ? 'RESTACK'
            : (0, detect_unsubmitted_changes_1.detectUnsubmittedChanges)(args.branchName)
                ? 'CHANGE'
                : args.draftToggle === true && prInfo.isDraft !== true
                    ? 'DRAFT'
                    : args.draftToggle === false && prInfo.isDraft !== false
                        ? 'PUBLISH'
                        : 'NOOP';
    context.splog.info(`▸ ${chalk_1.default.cyan(args.branchName)} (${{
        NOOP: 'No-op',
        CREATE: 'Create',
        RESTACK: 'Update - new parent',
        CHANGE: 'Update - code changes/restack',
        DRAFT: 'Mark as draft',
        PUBLISH: 'Ready for review',
    }[status]})`);
    return args.dryRun || status === 'NOOP'
        ? undefined
        : {
            branchName: args.branchName,
            ...(prNumber === undefined
                ? { update: false }
                : { update: true, prNumber }),
        };
}
async function getPRCreationInfo(args, context) {
    if (context.interactive) {
        context.splog.newline();
        context.splog.info(`Enter info for new pull request for ${chalk_1.default.yellow(args.branchName)} ▸ ${context.metaCache.getParentPrecondition(args.branchName)}:`);
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
    const createAsDraft = args.draftToggle ?? (await (0, pr_draft_1.getPRDraftStatus)(context));
    return {
        title: submitInfo.title,
        body: submitInfo.body,
        reviewers,
        draft: createAsDraft,
    };
}
//# sourceMappingURL=prepare_branches.js.map