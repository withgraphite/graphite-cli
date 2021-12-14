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
exports.logShortAction = void 0;
const chalk_1 = __importDefault(require("chalk"));
const errors_1 = require("../lib/errors");
const preconditions_1 = require("../lib/preconditions");
const utils_1 = require("../lib/utils");
const wrapper_classes_1 = require("../wrapper-classes");
function getStacks() {
    const stacks = new wrapper_classes_1.GitStackBuilder({
        useMemoizedResults: true,
    }).allStacks();
    const trunkStack = stacks.find((s) => s.source.branch.isTrunk());
    if (!trunkStack) {
        throw new errors_1.ExitFailedError(`Unable to find trunk stack`);
    }
    const fallenStacks = [];
    const untrackedStacks = [];
    stacks
        .filter((s) => !s.source.branch.isTrunk())
        .forEach((s) => {
        if (s.source.branch.getParentFromMeta()) {
            fallenStacks.push(s);
        }
        else {
            untrackedStacks.push(s);
        }
    });
    return { trunkStack, fallenStacks, untrackedStacks };
}
function logShortAction() {
    return __awaiter(this, void 0, void 0, function* () {
        const currentBranch = (0, preconditions_1.currentBranchPrecondition)();
        const stacks = getStacks();
        const tips = printStackNode(stacks.trunkStack.source, {
            indent: 0,
            currentBranch: currentBranch,
        });
        stacks.fallenStacks.sort(sortStacksByAge).forEach((s) => {
            printStackNode(s.source, {
                indent: 0,
                currentBranch,
            });
        });
        if (tips.needsFix || stacks.fallenStacks.length > 0) {
            logRebaseTip();
        }
        if (stacks.untrackedStacks.length > 0) {
            console.log('\nuntracked (created without Graphite)');
            stacks.untrackedStacks.sort(sortStacksByAge).forEach((s) => printStackNode(s.source, {
                indent: 0,
                currentBranch,
            }));
        }
        if (stacks.untrackedStacks.length > 0 || tips.untracked) {
            logRegenTip();
        }
    });
}
exports.logShortAction = logShortAction;
function sortStacksByAge(a, b) {
    return a.source.branch.lastCommitTime() > b.source.branch.lastCommitTime()
        ? -1
        : 1;
}
function printStackNode(node, opts) {
    const metaParent = node.branch.getParentFromMeta();
    let untracked = !metaParent && !node.branch.isTrunk();
    let needsFix = !!metaParent &&
        (!node.parent || metaParent.name !== node.parent.branch.name);
    console.log([
        // indent
        `${'  '.repeat(opts.indent)}`,
        // branch name, potentially highlighted
        node.branch.name === opts.currentBranch.name
            ? chalk_1.default.cyan(`↳ ${node.branch.name}`)
            : `↳ ${node.branch.name}`,
        // whether it needs a rebase or not
        ...(needsFix ? [chalk_1.default.yellow(`(off ${metaParent === null || metaParent === void 0 ? void 0 : metaParent.name})`)] : []),
        ...(untracked ? [chalk_1.default.yellow(`(untracked)`)] : []),
    ].join(' '));
    node.children.forEach((c) => {
        if (!c.branch.isTrunk()) {
            const tips = printStackNode(c, {
                indent: opts.indent + 1,
                currentBranch: opts.currentBranch,
            });
            untracked = tips.untracked || untracked;
            needsFix = tips.needsFix || needsFix;
        }
    });
    return { untracked, needsFix };
}
function logRebaseTip() {
    (0, utils_1.logTip)([
        `Some branch merge-bases have fallen behind their parent branch's latest commit. Consider:`,
        `> gt branch checkout ${(0, utils_1.getTrunk)()} && gt stack fix --rebase # fix all stacks`,
        `> gt branch checkout <branch> && gt stack fix --rebase # fix a specific stack`,
        `> gt branch checkout <branch> && gt upstack onto <parent> # fix a stack and update the parent`,
    ].join('\n'));
}
function logRegenTip() {
    (0, utils_1.logTip)([
        'Graphite does not know the parent of untracked branches. Consider:',
        `> gt branch checkout <branch> && gt upstack onto <parent> # fix a stack and update the parent`,
        `> gt branch checkout <branch> && gt stack fix --regen # generate stack based on current commit tree`,
        `> gt repo ignored-branches --add <branch> # set branch to be ignored by Graphite`,
        `> git branch -D <branch> # delete branch from git`,
    ].join('\n'));
}
//# sourceMappingURL=log_short.js.map