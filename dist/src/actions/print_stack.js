"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBranchTitle = exports.printStack = void 0;
const chalk_1 = __importDefault(require("chalk"));
const utils_1 = require("../lib/utils");
const trunk_1 = require("../lib/utils/trunk");
const wrapper_classes_1 = require("../wrapper-classes");
function printStack(args, context) {
    args.config.visited.push(args.baseBranch.name);
    const children = args.baseBranch.getChildrenFromGit(context);
    const currPrefix = getPrefix(args.indentLevel, args.config);
    /**
     * TODO(nicholasyan): we need to improve how we handle merges.
     *
     * C
     * |\
     * | B
     * |/
     * A
     *
     * For example in the above case, our logic will print the subtrees headed
     * by both B and C - which means that the subtree headed by C gets printed
     * twice.
     *
     * This is a short-term workaround to at least prevent duplicate printing
     * in the near-term: we mark already-visited nodes and make sure if we
     * hit an already-visited node, we just filter it out and skip it.
     */
    const unvisitedChildren = children.filter((child) => !child.isTrunk(context) && !args.config.visited.includes(child.name));
    unvisitedChildren.forEach((child, i) => {
        printStack({
            baseBranch: child,
            indentLevel: args.indentLevel + i,
            config: args.config,
        }, context);
    });
    // 1) if there is only 1 child, we only need to continue the parent's stem
    // 2) if there are multiple children, the 2..n children branch off
    //    horizontally
    const numChildren = unvisitedChildren.length;
    if (numChildren > 1) {
        let newBranchOffshoots = '│';
        // we only need to draw numChildren - 1 offshots since the first child
        // continues the parent's main stem
        for (let i = 1; i < numChildren; i++) {
            if (i < numChildren - 1) {
                newBranchOffshoots += '──┴';
            }
            else {
                newBranchOffshoots += '──┘';
            }
        }
        console.log(currPrefix + newBranchOffshoots);
        console.log(currPrefix + '│');
    }
    // print lines of branch info
    const branchInfo = getBranchInfo(args.baseBranch, args.config, context);
    branchInfo.forEach((line) => console.log(currPrefix + line));
    // print trailing stem
    // note: stem directly behind trunk should be dotted
    console.log(currPrefix +
        (!args.config.offTrunk && args.baseBranch.name === trunk_1.getTrunk(context).name
            ? '․'
            : '│'));
}
exports.printStack = printStack;
function getPrefix(indentLevel, config) {
    let prefix = '';
    for (let i = 0; i < indentLevel; i++) {
        // if we're behind trunk, the stem of trunk's branch should be dotted
        if (i === 0) {
            prefix += config.offTrunk ? '│  ' : '․  ';
        }
        else {
            prefix += '│  ';
        }
    }
    return prefix;
}
function getBranchInfo(branch, config, context) {
    let branchInfoLines = [];
    branchInfoLines.push(getBranchTitle(branch, config));
    const prInfo = branch.getPRInfo();
    const prTitle = prInfo === null || prInfo === void 0 ? void 0 : prInfo.title;
    if (prTitle !== undefined) {
        branchInfoLines.push(prTitle);
    }
    branchInfoLines.push(`${chalk_1.default.dim(utils_1.getCommitterDate({
        revision: branch.name,
        timeFormat: 'RELATIVE_READABLE',
    }))}`);
    if (!branch.isTrunk(context)) {
        const commits = branch.getCommitSHAs(context);
        if (commits.length !== 0) {
            commits.forEach((commitSHA) => {
                const commit = new wrapper_classes_1.Commit(commitSHA);
                branchInfoLines.push(chalk_1.default.gray(`* ${commit.sha.slice(0, 6)} - ${commit.messageSubject()}`));
            });
        }
    }
    branchInfoLines = dimMergedOrClosedBranches({
        lines: branchInfoLines,
        branch: branch,
    });
    branchInfoLines = prefixWithBranchStem({
        branch: branch,
        config: config,
        lines: branchInfoLines,
    });
    return branchInfoLines;
}
function getBranchTitle(branch, config) {
    var _a, _b, _c, _d;
    const prInfo = branch.getPRInfo();
    const branchName = ((_a = config.currentBranch) === null || _a === void 0 ? void 0 : _a.name) === branch.name
        ? chalk_1.default.cyan(`${branch.name} (current)`)
        : branch.name;
    const prNumber = prInfo !== undefined ? `PR #${prInfo.number}` : '';
    if ((prInfo === null || prInfo === void 0 ? void 0 : prInfo.state) === 'MERGED') {
        return `${branchName} ${prNumber} ${(_b = getPRState(prInfo)) !== null && _b !== void 0 ? _b : ''}`;
    }
    else if ((prInfo === null || prInfo === void 0 ? void 0 : prInfo.state) === 'CLOSED') {
        return `${chalk_1.default.strikethrough(`${branchName} ${prNumber}`)} ${(_c = getPRState(prInfo)) !== null && _c !== void 0 ? _c : ''}`;
    }
    else {
        return `${chalk_1.default.blueBright(branchName)} ${chalk_1.default.yellow(prNumber)} ${(_d = getPRState(prInfo)) !== null && _d !== void 0 ? _d : ''}`;
    }
}
exports.getBranchTitle = getBranchTitle;
function getPRState(prInfo) {
    if (prInfo === undefined) {
        return '';
    }
    if (prInfo.state === undefined && prInfo.reviewDecision === undefined) {
        return chalk_1.default.dim('Syncing PR Info...');
    }
    if (getMergedOrClosed(prInfo)) {
        switch (prInfo.state) {
            case 'CLOSED':
                return chalk_1.default.gray('(Abandoned)');
            case 'MERGED':
                return chalk_1.default.gray('(Merged)');
            default:
            // Intentional fallthrough - if not closed/merged, we want to display
            // the current review status.
        }
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
    }
    return '';
}
/**
 * Prefixes a set of lines with the appropriate branch stem.
 *
 * Before:
 * [
 *  "foo",
 *  "bar",
 *  "baz",
 * ]
 *
 * After:
 * [
 *  "◉ foo",
 *  "│ bar",
 *  "│ baz",
 * ]
 *
 */
function prefixWithBranchStem(args) {
    var _a;
    const isCurrentBranch = ((_a = args.config.currentBranch) === null || _a === void 0 ? void 0 : _a.name) === args.branch.name;
    const dot = isCurrentBranch ? chalk_1.default.cyan('◉') : '◯';
    return args.lines.map((line, index) => index === 0 ? `${dot} ${line}` : `│ ${line}`);
}
function dimMergedOrClosedBranches(args) {
    const isBranchMergedOrClosed = getMergedOrClosed(args.branch.getPRInfo());
    if (isBranchMergedOrClosed) {
        return args.lines.map((line) => chalk_1.default.dim.gray(line));
    }
    return args.lines;
}
function getMergedOrClosed(prInfo) {
    const state = prInfo === null || prInfo === void 0 ? void 0 : prInfo.state;
    return state === 'MERGED' || state === 'CLOSED';
}
//# sourceMappingURL=print_stack.js.map