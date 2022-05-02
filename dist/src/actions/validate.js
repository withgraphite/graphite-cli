"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = void 0;
const errors_1 = require("../lib/errors");
const preconditions_1 = require("../lib/preconditions");
const utils_1 = require("../lib/utils");
const wrapper_classes_1 = require("../wrapper-classes");
function validate(scope, context) {
    const currentBranch = preconditions_1.currentBranchPrecondition(context);
    const gitStack = new wrapper_classes_1.GitStackBuilder().getStack({ currentBranch, scope }, context);
    const metaStack = new wrapper_classes_1.MetaStackBuilder().getStack({ currentBranch, scope }, context);
    compareStacks(metaStack, gitStack);
    utils_1.logInfo(`Current stack is valid`);
    return metaStack.branches().filter((b) => !b.isTrunk(context));
}
exports.validate = validate;
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