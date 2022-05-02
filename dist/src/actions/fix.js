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
const cache_1 = require("../lib/config/cache");
const errors_1 = require("../lib/errors");
const preconditions_1 = require("../lib/preconditions");
const utils_1 = require("../lib/utils");
const indent_multiline_string_1 = require("../lib/utils/indent_multiline_string");
const wrapper_classes_1 = require("../wrapper-classes");
// Should be called whenever we change the tip of a branch
function rebaseUpstack(context) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield fixAction({
                action: 'rebase',
                mergeConflictCallstack: [],
                scope: 'upstack',
            }, context);
        }
        catch (_a) {
            utils_1.logWarn('Cannot fix upstack automatically, some uncommitted changes remain. Please commit or stash, and then `gt stack fix --rebase`');
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
        utils_1.logDebug(`Determining meta ${opts.scope} from ${currentBranch.name}`);
        const metaStack = opts.scope === 'stack'
            ? new wrapper_classes_1.MetaStackBuilder({
                useMemoizedResults: true,
            }).fullStackFromBranch(currentBranch, context)
            : new wrapper_classes_1.MetaStackBuilder({
                useMemoizedResults: true,
            }).upstackInclusiveFromBranchWithParents(currentBranch, context);
        utils_1.logDebug(`Found meta ${opts.scope}.`);
        utils_1.logDebug(metaStack.toString());
        utils_1.logDebug(`Determining full git ${opts.scope} from ${currentBranch.name}`);
        const gitStack = opts.scope === 'stack'
            ? new wrapper_classes_1.GitStackBuilder({
                useMemoizedResults: true,
            }).fullStackFromBranch(currentBranch, context)
            : new wrapper_classes_1.GitStackBuilder({
                useMemoizedResults: true,
            }).upstackInclusiveFromBranchWithParents(currentBranch, context);
        utils_1.logDebug(`Found full git ${opts.scope}`);
        utils_1.logDebug(gitStack.toString());
        // Consider noop
        if (metaStack.equals(gitStack)) {
            utils_1.logInfo(`No fix needed`);
            return;
        }
        const action = opts.action || (yield promptStacks({ gitStack, metaStack }));
        const stackFixActionContinuationFrame = {
            op: 'STACK_FIX_ACTION_CONTINUATION',
            checkoutBranchName: currentBranch.name,
        };
        if (action === 'regen') {
            regen(currentBranch, context, opts.scope);
        }
        else {
            // If we get interrupted and need to continue, first we'll do a stack fix
            // and then we'll continue the stack fix action.
            const mergeConflictCallstack = [
                {
                    op: 'STACK_FIX',
                    sourceBranchName: currentBranch.name,
                },
                stackFixActionContinuationFrame,
                ...opts.mergeConflictCallstack,
            ];
            for (const child of metaStack.source.children) {
                restackNode({
                    node: child,
                    mergeConflictCallstack: mergeConflictCallstack,
                }, context);
            }
        }
        stackFixActionContinuation(stackFixActionContinuationFrame);
    });
}
exports.fixAction = fixAction;
function stackFixActionContinuation(frame) {
    utils_1.checkoutBranch(frame.checkoutBranchName, { quiet: true });
}
exports.stackFixActionContinuation = stackFixActionContinuation;
function restackBranch(args, context) {
    const metaStack = new wrapper_classes_1.MetaStackBuilder().upstackInclusiveFromBranchWithParents(args.branch, context);
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
    restackNode({
        node: metaStack.source,
        mergeConflictCallstack: mergeConflictCallstack,
    }, context);
    stackFixActionContinuation(stackFixActionContinuationFrame);
}
exports.restackBranch = restackBranch;
function restackNode(args, context) {
    var _a;
    const node = args.node;
    if (utils_1.rebaseInProgress()) {
        throw new errors_1.RebaseConflictError(`Interactive rebase still in progress, cannot fix (${node.branch.name}).`, args.mergeConflictCallstack, context);
    }
    const parentBranch = (_a = node.parent) === null || _a === void 0 ? void 0 : _a.branch;
    if (!parentBranch) {
        throw new errors_1.ExitFailedError(`Cannot find parent in stack for (${node.branch.name}), stopping fix`);
    }
    const mergeBase = node.branch.getMetaMergeBase(context);
    if (!mergeBase) {
        throw new errors_1.ExitFailedError(`Cannot find a merge base in the stack for (${node.branch.name}), stopping fix`);
    }
    if (parentBranch.ref(context) === mergeBase) {
        utils_1.logInfo(`No fix needed for (${node.branch.name}) on (${parentBranch.name})`);
    }
    else {
        utils_1.logInfo(`Fixing (${chalk_1.default.green(node.branch.name)}) on (${parentBranch.name})`);
        utils_1.checkoutBranch(node.branch.name, { quiet: true });
        node.branch.savePrevRef();
        utils_1.gpExecSync({
            command: `git rebase --onto ${parentBranch.name} ${mergeBase} ${node.branch.name}`,
            options: { stdio: 'ignore' },
        }, () => {
            if (utils_1.rebaseInProgress()) {
                throw new errors_1.RebaseConflictError(`Interactive rebase in progress, cannot fix (${node.branch.name}) onto (${parentBranch.name}).`, args.mergeConflictCallstack, context);
            }
        });
        cache_1.cache.clearAll();
    }
    for (const child of node.children) {
        restackNode({
            node: child,
            mergeConflictCallstack: args.mergeConflictCallstack,
        }, context);
    }
}
function regen(branch, context, scope) {
    const trunk = utils_1.getTrunk(context);
    if (trunk.name == branch.name) {
        regenAllStacks(context);
        return;
    }
    const gitStack = scope === 'stack'
        ? new wrapper_classes_1.GitStackBuilder().fullStackFromBranch(branch, context)
        : new wrapper_classes_1.GitStackBuilder().upstackInclusiveFromBranchWithParents(branch, context);
    recursiveRegen(gitStack.source, context);
}
function regenAllStacks(context) {
    const allGitStacks = new wrapper_classes_1.GitStackBuilder().allStacks(context);
    utils_1.logInfo(`Computing regenerating ${allGitStacks.length} stacks...`);
    allGitStacks.forEach((stack) => {
        utils_1.logInfo(`\nRegenerating:\n${stack.toString()}`);
        recursiveRegen(stack.source, context);
    });
}
function recursiveRegen(node, context) {
    var _a;
    // The only time we expect newParent to be undefined is if we're fixing
    // the base branch which is behind trunk.
    const branch = node.branch;
    // Set parents if not trunk
    if (branch.name !== utils_1.getTrunk(context).name) {
        const oldParent = branch.getParentFromMeta(context);
        const newParent = ((_a = node.parent) === null || _a === void 0 ? void 0 : _a.branch) || utils_1.getTrunk(context);
        if (oldParent && oldParent.name === newParent.name) {
            utils_1.logInfo(`-> No change for (${branch.name}) with branch parent (${oldParent.name})`);
        }
        else {
            utils_1.logInfo(`-> Updating (${branch.name}) branch parent from (${oldParent === null || oldParent === void 0 ? void 0 : oldParent.name}) to (${chalk_1.default.green(newParent.name)})`);
            branch.setParentBranch(newParent);
        }
    }
    node.children.forEach((c) => recursiveRegen(c, context));
}
//# sourceMappingURL=fix.js.map