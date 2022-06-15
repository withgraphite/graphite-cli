"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBranchInfo = exports.showBranchAction = void 0;
const chalk_1 = __importDefault(require("chalk"));
const committer_date_1 = require("../lib/git/committer_date");
const show_commits_1 = require("../lib/git/show_commits");
async function showBranchAction(branchName, opts, context) {
    context.splog.info(getBranchInfo({ branchName }, context).join('\n'));
    const parentBranchName = context.metaCache.getParent(branchName);
    if (parentBranchName) {
        context.splog.info(`${chalk_1.default.cyan('Parent')}: ${parentBranchName}`);
    }
    const children = context.metaCache.getChildren(branchName);
    if (children.length) {
        context.splog.info(`${chalk_1.default.cyan('Children')}:\n${children.map((c) => `▸ ${c}`).join('\n')}`);
    }
    const description = opts.description && context.metaCache.getPrInfo(branchName)?.body;
    if (description) {
        context.splog.newline();
        context.splog.info(description);
    }
    if (context.metaCache.isTrunk(branchName)) {
        return;
    }
    context.splog.newline();
    (0, show_commits_1.showCommits)(context.metaCache.getBaseRevision(branchName), branchName, opts.patch);
}
exports.showBranchAction = showBranchAction;
function getBranchInfo(args, context) {
    const prInfo = context.metaCache.isTrunk(args.branchName)
        ? undefined
        : context.metaCache.getPrInfo(args.branchName);
    const prTitleLine = getPRTitleLine(prInfo);
    const branchInfoLines = [
        `${args.displayAsCurrent
            ? chalk_1.default.cyan(`${args.branchName} (current)`)
            : chalk_1.default.blueBright(args.branchName)} ${context.metaCache.isBranchFixed(args.branchName)
            ? ''
            : chalk_1.default.yellow(`(needs restack)`)}`,
        `${chalk_1.default.dim((0, committer_date_1.getCommitterDate)({
            revision: args.branchName,
            timeFormat: 'RELATIVE_READABLE',
        }))}`,
        ...(prTitleLine ? ['', prTitleLine] : []),
        ...(prInfo?.url ? [chalk_1.default.magenta(prInfo.url)] : []),
        '',
        ...(args.showCommitNames && !context.metaCache.isTrunk(args.branchName)
            ? getCommitLines(args.branchName, args.showCommitNames === 'REVERSE', context)
            : []),
    ];
    return prInfo?.state === 'MERGED' || prInfo?.state === 'CLOSED'
        ? branchInfoLines.map((line) => chalk_1.default.dim.gray(line))
        : branchInfoLines;
}
exports.getBranchInfo = getBranchInfo;
function getPRTitleLine(prInfo) {
    if (!prInfo?.title || !prInfo?.number) {
        return undefined;
    }
    const prNumber = `PR #${prInfo.number}`;
    if (prInfo?.state === 'MERGED') {
        return `${prNumber} (Merged) ${prInfo.title}`;
    }
    else if (prInfo?.state === 'CLOSED') {
        return `${prNumber} (Abandoned) ${chalk_1.default.strikethrough(`${prInfo.title}`)}`;
    }
    else {
        return `${chalk_1.default.yellow(prNumber)} ${getPRState(prInfo)} ${prInfo.title}`;
    }
}
function getPRState(prInfo) {
    if (prInfo === undefined) {
        return '';
    }
    if (prInfo.isDraft) {
        return chalk_1.default.gray('(Draft)');
    }
    const reviewDecision = prInfo.reviewDecision;
    switch (reviewDecision) {
        case 'APPROVED':
            return chalk_1.default.green('(Approved)');
        case 'CHANGES_REQUESTED':
            return chalk_1.default.magenta('(Changes Requested)');
        case 'REVIEW_REQUIRED':
            return chalk_1.default.yellow('(Review Required)');
        default:
            // Intentional fallthrough - if there's no review decision, that means that
            // review isn't required and we can skip displaying a review status.
            return '';
    }
}
function getCommitLines(branchName, reverse, context) {
    const lines = context.metaCache
        .getAllCommits(branchName, 'READABLE')
        .map((line) => chalk_1.default.gray(line));
    return reverse ? lines.reverse() : lines;
}
//# sourceMappingURL=show_branch.js.map