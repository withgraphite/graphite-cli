"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPRInfoForBranches = void 0;
const chalk_1 = __importDefault(require("chalk"));
const errors_1 = require("../../lib/errors");
const detect_unsubmitted_changes_1 = require("../../lib/utils/detect_unsubmitted_changes");
const splog_1 = require("../../lib/utils/splog");
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
function getPRInfoForBranches(args, context) {
    return __awaiter(this, void 0, void 0, function* () {
        splog_1.logInfo(chalk_1.default.blueBright('🥞 [Step 2] Preparing to submit PRs for the following branches...'));
        return yield Promise.all(args.branches
            .map((branch) => getPRAction({
            branch,
            updateOnly: args.updateOnly,
            draftToggle: args.draftToggle,
            dryRun: args.dryRun,
        }, context))
            .filter((action) => action !== undefined)
            .map((action) => __awaiter(this, void 0, void 0, function* () {
            return action.update
                ? {
                    action: 'update',
                    prNumber: action.prNumber,
                    draft: args.draftToggle,
                    head: action.branch.name,
                    headSha: action.branch.getCurrentRef(),
                    base: action.parent.name,
                    baseSha: action.branch.getParentBranchSha(),
                    branch: action.branch,
                }
                : yield getPRCreationInfo({
                    branch: action.branch,
                    parentBranchName: action.parent.name,
                    editPRFieldsInline: args.editPRFieldsInline,
                    draftToggle: args.draftToggle,
                    reviewers: args.reviewers,
                }, context);
        }))).then((info) => {
            splog_1.logNewline();
            return info;
        });
    });
}
exports.getPRInfoForBranches = getPRInfoForBranches;
function getPRAction(args, context) {
    var _a;
    // The branch here should always have a parent - above, the branches we've
    // gathered should exclude trunk which ensures that every branch we're submitting
    // a PR for has a valid parent.
    const parent = args.branch.getParentFromMeta(context);
    if (parent === undefined) {
        throw new errors_1.PreconditionsFailedError(`Could not find parent for branch ${args.branch.name} to submit PR against. Please checkout ${args.branch.name} and run \`gt upstack onto <parent_branch>\` to set its parent.`);
    }
    const prNumber = (_a = args.branch.getPRInfo()) === null || _a === void 0 ? void 0 : _a.number;
    const status = prNumber === undefined
        ? args.updateOnly
            ? 'NOOP'
            : 'CREATE'
        : args.branch.isBaseSameAsRemotePr(context)
            ? 'RESTACK'
            : detect_unsubmitted_changes_1.detectUnsubmittedChanges(args.branch)
                ? 'CHANGE'
                : args.draftToggle === undefined
                    ? 'NOOP'
                    : args.draftToggle
                        ? 'DRAFT'
                        : 'PUBLISH';
    splog_1.logInfo(`▸ ${chalk_1.default.cyan(args.branch.name)} (${{
        CREATE: 'Create',
        CHANGE: 'Update - code changes/rebase',
        DRAFT: 'Convert to draft - set draft status',
        NOOP: 'No-op',
        PUBLISH: 'Ready for review - set draft status',
        RESTACK: 'Update - restacked',
    }[status]})`);
    return args.dryRun || status === 'NOOP'
        ? undefined
        : Object.assign({ branch: args.branch, parent }, (prNumber === undefined
            ? { update: false }
            : { update: true, prNumber }));
}
function getPRCreationInfo(args, context) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        splog_1.logNewline();
        splog_1.logInfo(`Enter info for new pull request for ${chalk_1.default.yellow(args.branch.name)} ▸ ${args.parentBranchName}:`);
        const submitInfo = {
            title: yield pr_title_1.getPRTitle({
                branch: args.branch,
                editPRFieldsInline: args.editPRFieldsInline,
            }, context),
            body: yield pr_body_1.getPRBody({
                branch: args.branch,
                editPRFieldsInline: args.editPRFieldsInline,
            }, context),
            reviewers: yield reviewers_1.getReviewers({
                fetchReviewers: args.reviewers,
            }),
        };
        args.branch.upsertPriorSubmitInfo(submitInfo);
        const createAsDraft = (_a = args.draftToggle) !== null && _a !== void 0 ? _a : (yield pr_draft_1.getPRDraftStatus());
        return Object.assign(Object.assign({}, submitInfo), { action: 'create', draft: createAsDraft, head: args.branch.name, headSha: args.branch.getCurrentRef(), base: args.parentBranchName, baseSha: args.branch.getParentBranchSha(), branch: args.branch });
    });
}
//# sourceMappingURL=prepare_branches.js.map