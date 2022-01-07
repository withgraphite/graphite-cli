"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = exports.validateStack = void 0;
const errors_1 = require("../lib/errors");
const preconditions_1 = require("../lib/preconditions");
const utils_1 = require("../lib/utils");
const wrapper_classes_1 = require("../wrapper-classes");
function validateStack(scope, stack) {
    const branch = preconditions_1.currentBranchPrecondition();
    let gitStack;
    switch (scope) {
        case 'FULLSTACK':
            gitStack = new wrapper_classes_1.GitStackBuilder().fullStackFromBranch(branch);
            compareStacks(stack, gitStack);
            break;
        case 'UPSTACK':
            gitStack = new wrapper_classes_1.GitStackBuilder().upstackInclusiveFromBranchWithParents(branch);
            stack.source.parent = undefined;
            gitStack.source.parent = undefined;
            compareStacks(stack, gitStack);
            break;
        case 'DOWNSTACK':
            gitStack = new wrapper_classes_1.GitStackBuilder().downstackFromBranch(branch);
            stack.source.children = [];
            gitStack.source.children = [];
            compareStacks(stack, gitStack);
            break;
    }
    utils_1.logInfo(`Validation for current stack: passed`);
}
exports.validateStack = validateStack;
function validate(scope) {
    const branch = preconditions_1.currentBranchPrecondition();
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
    utils_1.logInfo(`Current stack is valid`);
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