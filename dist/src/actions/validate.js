"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStacksForValidation = exports.backfillParentShasOnValidatedStack = exports.validate = void 0;
const errors_1 = require("../lib/errors");
const preconditions_1 = require("../lib/preconditions");
const utils_1 = require("../lib/utils");
const wrapper_classes_1 = require("../wrapper-classes");
const branch_1 = require("../wrapper-classes/branch");
function validate(scope, context) {
    const { metaStack, gitStack } = getStacksForValidation(scope, context);
    if (!metaStack.equals(gitStack)) {
        throw new errors_1.ValidationFailedError([
            `Graphite stack does not match git-derived stack\n`,
            '\nGraphite Stack:',
            metaStack.toString(),
            '\nGit Stack:',
            gitStack.toString(),
        ].join('\n'));
    }
    // Stacks are valid, we can update parentRevision
    // TODO: Remove after migrating validation to parentRevision
    backfillParentShasOnValidatedStack(metaStack, context);
    utils_1.logInfo(`Current stack is valid`);
    return metaStack
        .branches()
        .filter((b) => !b.isTrunk(context))
        .map((b) => new branch_1.Branch(b.name));
}
exports.validate = validate;
function backfillParentShasOnValidatedStack(stack, context) {
    stack
        .branches()
        .map((b) => b.name)
        .forEach((branchName) => {
        const branch = branch_1.Branch.branchWithName(branchName, context);
        const parentBranch = branch.getParentFromMeta(context);
        if (parentBranch &&
            branch.getParentBranchSha() !== parentBranch.getCurrentRef()) {
            utils_1.logDebug(`Updating parent revision of ${branch}`);
            branch.setParentBranch(parentBranch);
        }
    });
}
exports.backfillParentShasOnValidatedStack = backfillParentShasOnValidatedStack;
function getStacksForValidation(scope, context) {
    const currentBranch = preconditions_1.currentBranchPrecondition(context);
    utils_1.logDebug(`Determining meta ${scope} from ${currentBranch.name}`);
    const metaStack = new wrapper_classes_1.MetaStackBuilder({ useMemoizedResults: true }).getStack({ currentBranch, scope }, context);
    utils_1.logDebug(`Found meta ${scope}.`);
    utils_1.logDebug(metaStack.toString());
    utils_1.logDebug(`Determining full git ${scope} from ${currentBranch.name}`);
    const gitStack = new wrapper_classes_1.GitStackBuilder({ useMemoizedResults: true }).getStack({ currentBranch, scope }, context);
    utils_1.logDebug(`Found full git ${scope}`);
    utils_1.logDebug(gitStack.toString());
    return {
        metaStack,
        gitStack,
    };
}
exports.getStacksForValidation = getStacksForValidation;
//# sourceMappingURL=validate.js.map