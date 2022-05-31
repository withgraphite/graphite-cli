"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStacksForValidation = exports.backfillParentShasOnValidatedStack = exports.validate = void 0;
const errors_1 = require("../lib/errors");
const preconditions_1 = require("../lib/preconditions");
const branch_1 = require("../wrapper-classes/branch");
const git_stack_builder_1 = require("../wrapper-classes/git_stack_builder");
const meta_stack_builder_1 = require("../wrapper-classes/meta_stack_builder");
function validate(scope, context) {
    const currentBranch = preconditions_1.currentBranchPrecondition(context);
    const { metaStack, gitStack } = getStacksForValidation(currentBranch, scope, context);
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
    context.splog.logDebug(`Current stack is valid`);
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
        const branch = branch_1.Branch.branchWithName(branchName);
        const parentBranch = branch.getParentFromMeta(context);
        if (parentBranch &&
            branch.getParentBranchSha() !== parentBranch.getCurrentRef()) {
            context.splog.logDebug(`Updating parent revision of ${branch}`);
            branch.setParentBranch(parentBranch);
        }
    });
}
exports.backfillParentShasOnValidatedStack = backfillParentShasOnValidatedStack;
function getStacksForValidation(currentBranch, scope, context) {
    context.splog.logDebug(`Determining meta ${scope} from ${currentBranch.name}`);
    const metaStack = new meta_stack_builder_1.MetaStackBuilder({ useMemoizedResults: true }).getStack({ currentBranch, scope }, context);
    context.splog.logDebug(`Found meta ${scope}.`);
    context.splog.logDebug(metaStack.toString());
    context.splog.logDebug(`Determining full git ${scope} from ${currentBranch.name}`);
    const gitStack = new git_stack_builder_1.GitStackBuilder({ useMemoizedResults: true }).getStack({ currentBranch, scope }, context);
    context.splog.logDebug(`Found full git ${scope}`);
    context.splog.logDebug(gitStack.toString());
    return {
        metaStack,
        gitStack,
    };
}
exports.getStacksForValidation = getStacksForValidation;
//# sourceMappingURL=validate.js.map