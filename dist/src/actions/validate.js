"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = exports.validateStack = void 0;
const errors_1 = require("../lib/errors");
const preconditions_1 = require("../lib/preconditions");
const utils_1 = require("../lib/utils");
const wrapper_classes_1 = require("../wrapper-classes");
function validateStack(scope, stack) {
    const branch = (0, preconditions_1.currentBranchPrecondition)();
    switch (scope) {
        case 'FULLSTACK': {
            const gitStack = new wrapper_classes_1.GitStackBuilder().fullStackFromBranch(branch);
            compareStacks(stack, gitStack);
            break;
        }
        case 'UPSTACK': {
            const gitStack = new wrapper_classes_1.GitStackBuilder().upstackInclusiveFromBranchWithParents(branch);
            // Since we're modifying the stack, we want to make sure not to modify
            // the passed-in value. We re-derive the stack here but can improve this
            // in the future by just deep-copying the stack.
            const metadataStack = new wrapper_classes_1.MetaStackBuilder().upstackInclusiveFromBranchWithParents(branch);
            metadataStack.source.parent = undefined;
            gitStack.source.parent = undefined;
            compareStacks(metadataStack, gitStack);
            break;
        }
        case 'DOWNSTACK': {
            const gitStack = new wrapper_classes_1.GitStackBuilder().downstackFromBranch(branch);
            // Since we're modifying the stack, we want to make sure not to modify
            // the passed-in value. We re-derive the stack here but can improve this
            // in the future by just deep-copying the stack.
            const metadataStack = new wrapper_classes_1.MetaStackBuilder().downstackFromBranch(branch);
            metadataStack.source.children = [];
            gitStack.source.children = [];
            compareStacks(metadataStack, gitStack);
            break;
        }
    }
    (0, utils_1.logInfo)(`Validation for current stack: passed`);
}
exports.validateStack = validateStack;
function validate(scope) {
    const branch = (0, preconditions_1.currentBranchPrecondition)();
    switch (scope) {
        case 'UPSTACK':
            validateBranchUpstackInclusive(branch);
            break;
        case 'DOWNSTACK':
            validateBranchDownstackInclusive(branch);
            break;
        case 'FULLSTACK':
            validateBranchFullstack(branch);
            break;
    }
    (0, utils_1.logInfo)(`Current stack is valid`);
}
exports.validate = validate;
function validateBranchFullstack(branch) {
    const metaStack = new wrapper_classes_1.MetaStackBuilder().fullStackFromBranch(branch);
    const gitStack = new wrapper_classes_1.GitStackBuilder().fullStackFromBranch(branch);
    compareStacks(metaStack, gitStack);
}
function validateBranchDownstackInclusive(branch) {
    const metaStack = new wrapper_classes_1.MetaStackBuilder().downstackFromBranch(branch);
    const gitStack = new wrapper_classes_1.GitStackBuilder().downstackFromBranch(branch);
    compareStacks(metaStack, gitStack);
}
function validateBranchUpstackInclusive(branch) {
    const metaStack = new wrapper_classes_1.MetaStackBuilder().upstackInclusiveFromBranchWithParents(branch);
    const gitStack = new wrapper_classes_1.GitStackBuilder().upstackInclusiveFromBranchWithParents(branch);
    metaStack.source.parent = undefined;
    gitStack.source.parent = undefined;
    compareStacks(metaStack, gitStack);
}
function compareStacks(metaStack, gitStack) {
    if (!metaStack.equals(gitStack)) {
        throw new errors_1.ValidationFailedError([
            `Graphite stack does not match git-derived stack\n`,
            '\nGraphite Stack:',
            metaStack.toString(),
            '\nGit Stack:',
            gitStack.toString(),
        ].join('\n'));
    }
}
//# sourceMappingURL=validate.js.map