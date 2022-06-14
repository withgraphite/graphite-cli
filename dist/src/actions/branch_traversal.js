"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.switchBranchAction = void 0;
const chalk_1 = __importDefault(require("chalk"));
const prompts_1 = __importDefault(require("prompts"));
const errors_1 = require("../lib/errors");
async function switchBranchAction(branchNavigation, context) {
    const currentBranchName = context.metaCache.currentBranchPrecondition;
    context.splog.info(chalk_1.default.blueBright(currentBranchName));
    const newBranchName = await traverseBranches(branchNavigation, currentBranchName, context);
    if (newBranchName !== currentBranchName) {
        context.metaCache.checkoutBranch(newBranchName);
        context.splog.info(`Checked out ${chalk_1.default.cyan(newBranchName)}.`);
        return;
    }
    context.splog.info(`Already at the ${branchNavigation.direction === 'DOWN' ||
        branchNavigation.direction === 'BOTTOM'
        ? 'bottom most'
        : 'top most'} branch in the stack.`);
}
exports.switchBranchAction = switchBranchAction;
async function traverseBranches(branchNavigation, fromBranchName, context) {
    switch (branchNavigation.direction) {
        case 'BOTTOM': {
            return traverseDownward(fromBranchName, context);
        }
        case 'DOWN': {
            return traverseDownward(fromBranchName, context, branchNavigation.numSteps > 1 ? branchNavigation.numSteps : 1);
        }
        case 'TOP': {
            return await traverseUpward(fromBranchName, context);
        }
        case 'UP': {
            return await traverseUpward(fromBranchName, context, branchNavigation.numSteps > 1 ? branchNavigation.numSteps : 1);
        }
    }
}
function traverseDownward(currentBranchName, context, stepsRemaining = 'bottom') {
    if (stepsRemaining === 0 || context.metaCache.isTrunk(currentBranchName)) {
        return currentBranchName;
    }
    const parentBranchName = context.metaCache.getParentPrecondition(currentBranchName);
    if (stepsRemaining === 'bottom' &&
        context.metaCache.isTrunk(parentBranchName)) {
        return currentBranchName;
    }
    context.splog.info('⮑  ' + parentBranchName);
    return traverseDownward(parentBranchName, context, stepsRemaining === 'bottom' ? 'bottom' : stepsRemaining - 1);
}
async function traverseUpward(currentBranchName, context, stepsRemaining = 'top') {
    if (stepsRemaining === 0) {
        return currentBranchName;
    }
    const children = context.metaCache.getChildren(currentBranchName);
    if (children.length === 0) {
        return currentBranchName;
    }
    const childBranchName = children.length === 1
        ? children[0]
        : await handleMultipleChildren(children, context);
    context.splog.info('⮑  ' + childBranchName);
    return await traverseUpward(childBranchName, context, stepsRemaining === 'top' ? 'top' : stepsRemaining - 1);
}
async function handleMultipleChildren(children, context) {
    if (!context.interactive) {
        throw new errors_1.ExitFailedError(`Cannot get upstack branch in non-interactive mode; multiple choices available:\n${children.join('\n')}`);
    }
    return (await (0, prompts_1.default)({
        type: 'select',
        name: 'value',
        message: 'Multiple branches found at the same level. Select a branch to guide the navigation',
        choices: children.map((b) => {
            return { title: b, value: b };
        }),
    }, {
        onCancel: () => {
            throw new errors_1.KilledError();
        },
    })).value;
}
//# sourceMappingURL=branch_traversal.js.map