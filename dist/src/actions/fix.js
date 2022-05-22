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
exports.restackBranch = exports.stackFixActionContinuation = exports.fixAction = exports.rebaseUpstack = void 0;
const chalk_1 = __importDefault(require("chalk"));
const prompts_1 = __importDefault(require("prompts"));
const errors_1 = require("../lib/errors");
const preconditions_1 = require("../lib/preconditions");
const checkout_branch_1 = require("../lib/utils/checkout_branch");
const indent_multiline_string_1 = require("../lib/utils/indent_multiline_string");
const rebase_in_progress_1 = require("../lib/utils/rebase_in_progress");
const rebase_onto_1 = require("../lib/utils/rebase_onto");
const splog_1 = require("../lib/utils/splog");
const trunk_1 = require("../lib/utils/trunk");
const git_stack_builder_1 = require("../wrapper-classes/git_stack_builder");
const validate_1 = require("./validate");
// Should be called whenever we change the tip of a branch
function rebaseUpstack(context) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield fixAction({
                action: 'rebase',
                scope: 'UPSTACK',
            }, context);
        }
        catch (_a) {
            splog_1.logWarn('Cannot fix upstack automatically, some uncommitted changes remain. Please commit or stash, and then `gt upstack fix --rebase`');
        }
    });
}
exports.rebaseUpstack = rebaseUpstack;
function promptStacks(opts) {
    return __awaiter(this, void 0, void 0, function* () {
        const response = yield prompts_1.default({
            type: 'select',
            name: 'value',
            message: `Rebase branches or regenerate stacks metadata?`,
            choices: [
                {
                    title: `rebase branches, using Graphite stacks as truth (${chalk_1.default.green('common choice')})\n` +
                        indent_multiline_string_1.indentMultilineString(opts.metaStack.toString(), 4) +
                        '\n',
                    value: 'rebase',
                },
                {
                    title: `regen stack metadata, using Git commit tree as truth\n` +
                        indent_multiline_string_1.indentMultilineString(opts.gitStack.toString(), 4) +
                        +'\n',
                    value: 'regen',
                },
            ],
        }, {
            onCancel: () => {
                throw new errors_1.KilledError();
            },
        });
        if (!response.value) {
            throw new errors_1.ExitCancelledError('No changes made');
        }
        return response.value;
    });
}
function fixAction(opts, context) {
    return __awaiter(this, void 0, void 0, function* () {
        const currentBranch = preconditions_1.currentBranchPrecondition(context);
        preconditions_1.uncommittedTrackedChangesPrecondition();
        const { metaStack, gitStack } = validate_1.getStacksForValidation(currentBranch, opts.scope, context);
        // Consider noop
        if (metaStack.equals(gitStack)) {
            splog_1.logInfo(`No fix needed`);
            // Stacks are valid, we can update parentRevision
            // TODO: Remove after migrating validation to parentRevision
            validate_1.backfillParentShasOnValidatedStack(metaStack, context);
            return;
        }
        const action = opts.action || (yield promptStacks({ gitStack, metaStack }));
        if (action === 'regen') {
            regen(currentBranch, context, opts.scope);
            return;
        }
        const stackFixActionContinuationFrame = {
            op: 'STACK_FIX_ACTION_CONTINUATION',
            checkoutBranchName: currentBranch.name,
        };
        // If we get interrupted and need to continue, first we'll do a stack fix
        // and then we'll continue the stack fix action.
        const mergeConflictCallstack = [
            {
                op: 'STACK_FIX',
                sourceBranchName: currentBranch.name,
            },
            stackFixActionContinuationFrame,
        ];
        metaStack.source.children.forEach((child) => restackUpstack({
            branch: child.branch,
            mergeConflictCallstack: mergeConflictCallstack,
        }, context));
        stackFixActionContinuation(stackFixActionContinuationFrame);
    });
}
exports.fixAction = fixAction;
function stackFixActionContinuation(frame) {
    checkout_branch_1.checkoutBranch(frame.checkoutBranchName, { quiet: true });
}
exports.stackFixActionContinuation = stackFixActionContinuation;
function restackBranch(args, context) {
    const stackFixActionContinuationFrame = {
        op: 'STACK_FIX_ACTION_CONTINUATION',
        checkoutBranchName: args.branch.name,
    };
    const mergeConflictCallstack = [
        {
            op: 'STACK_FIX',
            sourceBranchName: args.branch.name,
        },
        stackFixActionContinuationFrame,
        ...args.mergeConflictCallstack,
    ];
    restackUpstack({
        branch: args.branch,
        mergeConflictCallstack: mergeConflictCallstack,
    }, context);
    stackFixActionContinuation(stackFixActionContinuationFrame);
}
exports.restackBranch = restackBranch;
function restackUpstack(args, context) {
    const branch = args.branch;
    if (rebase_in_progress_1.rebaseInProgress()) {
        throw new errors_1.RebaseConflictError(`Interactive rebase still in progress, cannot fix (${branch.name}).`, args.mergeConflictCallstack, context);
    }
    const parentBranch = branch.getParentFromMeta(context);
    if (!parentBranch) {
        throw new errors_1.ExitFailedError(`Cannot find parent in stack for (${branch.name}), stopping fix`);
    }
    const mergeBase = branch.getMetaMergeBase(context);
    if (!mergeBase) {
        throw new errors_1.ExitFailedError(`Cannot find a merge base in the stack for (${branch.name}), stopping fix`);
    }
    const rebased = rebase_onto_1.rebaseOnto({
        onto: parentBranch,
        mergeBase,
        branch,
        mergeConflictCallstack: args.mergeConflictCallstack,
    }, context);
    if (rebased) {
        splog_1.logInfo(`Fixed (${chalk_1.default.green(branch.name)}) on (${parentBranch.name})`);
    }
    // Stacks are now valid, we can update parentRevision
    // TODO: Remove after migrating validation to parentRevision
    if (branch.getParentBranchSha() !== parentBranch.getCurrentRef()) {
        splog_1.logDebug(`Updating parent revision`);
        branch.setParentBranch(parentBranch);
    }
    branch.getChildrenFromMeta(context).forEach((child) => restackUpstack({
        branch: child,
        mergeConflictCallstack: args.mergeConflictCallstack,
    }, context));
}
function regen(branch, context, scope) {
    const trunk = trunk_1.getTrunk(context);
    if (trunk.name == branch.name) {
        regenAllStacks(context);
        return;
    }
    const gitStack = scope === 'FULLSTACK'
        ? new git_stack_builder_1.GitStackBuilder().fullStackFromBranch(branch, context)
        : new git_stack_builder_1.GitStackBuilder().upstackInclusiveFromBranchWithParents(branch, context);
    recursiveRegen(gitStack.source, context);
}
function regenAllStacks(context) {
    const allGitStacks = new git_stack_builder_1.GitStackBuilder().allStacks(context);
    splog_1.logInfo(`Computing regenerating ${allGitStacks.length} stacks...`);
    allGitStacks.forEach((stack) => {
        splog_1.logInfo(`\nRegenerating:\n${stack.toString()}`);
        recursiveRegen(stack.source, context);
    });
}
function recursiveRegen(node, context) {
    var _a;
    // The only time we expect newParent to be undefined is if we're fixing
    // the base branch which is behind trunk.
    const branch = node.branch;
    // Set parents if not trunk
    if (branch.name !== trunk_1.getTrunk(context).name) {
        const oldParent = branch.getParentFromMeta(context);
        const newParent = ((_a = node.parent) === null || _a === void 0 ? void 0 : _a.branch) || trunk_1.getTrunk(context);
        if (oldParent && oldParent.name === newParent.name) {
            splog_1.logInfo(`-> No change for (${branch.name}) with branch parent (${oldParent.name})`);
            // Stacks are valid, we can update parentRevision
            // TODO: Remove after migrating validation to parentRevision
            if (branch.getParentBranchSha() !== newParent.getCurrentRef()) {
                splog_1.logDebug(`Updating parent revision`);
                branch.setParentBranch(newParent);
            }
        }
        else {
            splog_1.logInfo(`-> Updating (${branch.name}) branch parent from (${oldParent === null || oldParent === void 0 ? void 0 : oldParent.name}) to (${chalk_1.default.green(newParent.name)})`);
            branch.setParentBranch(newParent);
        }
    }
    node.children.forEach((c) => recursiveRegen(c, context));
}
//# sourceMappingURL=fix.js.map