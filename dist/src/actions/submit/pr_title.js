"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.inferPRTitle = exports.getPRTitle = void 0;
const prompts_1 = __importDefault(require("prompts"));
const errors_1 = require("../../lib/errors");
const commit_message_1 = require("../../lib/git/commit_message");
async function getPRTitle(args, context) {
    const title = inferPRTitle(args.branchName, context);
    if (!args.editPRFieldsInline) {
        return title;
    }
    const response = await (0, prompts_1.default)({
        type: 'text',
        name: 'title',
        message: 'Title',
        initial: title,
    }, {
        onCancel: () => {
            throw new errors_1.KilledError();
        },
    });
    return response.title ?? title;
}
exports.getPRTitle = getPRTitle;
function inferPRTitle(branchName, context) {
    const priorSubmitTitle = context.metaCache.getPrInfo(branchName)?.title;
    if (priorSubmitTitle !== undefined) {
        return priorSubmitTitle;
    }
    // Only infer the title from the commit if the branch has just 1 commit.
    const commits = context.metaCache.getAllCommits(branchName, 'SHA');
    const singleCommitSubject = commits.length === 1 ? (0, commit_message_1.getCommitMessage)(commits[0], 'SUBJECT') : undefined;
    return singleCommitSubject?.length
        ? singleCommitSubject
        : `Merge ${branchName} into ${context.metaCache.getParentPrecondition(branchName)}`;
}
exports.inferPRTitle = inferPRTitle;
//# sourceMappingURL=pr_title.js.map