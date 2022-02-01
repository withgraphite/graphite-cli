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
exports.restackBranch = exports.stackFixActionContinuation = exports.fixAction = void 0;
const chalk_1 = __importDefault(require("chalk"));
const prompts_1 = __importDefault(require("prompts"));
const config_1 = require("../lib/config");
const errors_1 = require("../lib/errors");
const preconditions_1 = require("../lib/preconditions");
const utils_1 = require("../lib/utils");
const wrapper_classes_1 = require("../wrapper-classes");
function promptStacks(opts) {
    return __awaiter(this, void 0, void 0, function* () {
        const response = yield (0, prompts_1.default)({
            type: 'select',
            name: 'value',
            message: `Rebase branches or regenerate stacks metadata?`,
            choices: ['rebase', 'regen'].map((r) => {
                return {
                    title: r === 'rebase'
                        ? `rebase branches, using Graphite stacks as truth (${chalk_1.default.green('common choice')})\n` +
                            opts.metaStack
                                .toString()
                                .split('\n')
                                .map((l) => '    ' + l)
                                .join('\n') +
                            '\n'
                        : `regen stack metadata, using Git commit tree as truth\n` +
                            opts.gitStack
                                .toString()
                                .split('\n')
                                .map((l) => '    ' + l)
                                .join('\n') +
                            '\n',
                    value: r,
                };
            }, {
                onCancel: () => {
                    throw new errors_1.KilledError();
                },
            }),
        });
        if (!response.value) {
            throw new errors_1.ExitCancelledError('No changes made');
        }
        return response.value;
    });
}
function fixAction(opts) {
    return __awaiter(this, void 0, void 0, function* () {
        const currentBranch = (0, preconditions_1.currentBranchPrecondition)();
        (0, preconditions_1.uncommittedTrackedChangesPrecondition)();
        (0, utils_1.logDebug)(`Determining full meta stack from ${currentBranch.name}`);
        const metaStack = new wrapper_classes_1.MetaStackBuilder({
            useMemoizedResults: true,
        }).fullStackFromBranch(currentBranch);
        (0, utils_1.logDebug)(`Found full meta stack.`);
        (0, utils_1.logDebug)(metaStack.toString());
        (0, utils_1.logDebug)(`Determining full git stack from ${currentBranch.name}`);
        const gitStack = new wrapper_classes_1.GitStackBuilder({
            useMemoizedResults: true,
        }).fullStackFromBranch(currentBranch);
        (0, utils_1.logDebug)(`Found full git stack`);
        (0, utils_1.logDebug)(gitStack.toString());
        // Consider noop
        if (metaStack.equals(gitStack)) {
            (0, utils_1.logInfo)(`No fix needed`);
            return;
        }
        const action = opts.action || (yield promptStacks({ gitStack, metaStack }));
        const stackFixActionContinuationFrame = {
            op: 'STACK_FIX_ACTION_CONTINUATION',
            checkoutBranchName: currentBranch.name,
        };
        if (action === 'regen') {
            yield regen(currentBranch);
        }
        else {
            // If we get interrupted and need to continue, first we'll do a stack fix
            // and then we'll continue the stack fix action.
            const mergeConflictCallstack = {
                frame: {
                    op: 'STACK_FIX',
                    sourceBranchName: currentBranch.name,
                },
                parent: {
                    frame: stackFixActionContinuationFrame,
                    parent: opts.mergeConflictCallstack,
                },
            };
            for (const child of metaStack.source.children) {
                yield restackNode({
                    node: child,
                    mergeConflictCallstack: mergeConflictCallstack,
                });
            }
        }
        yield stackFixActionContinuation(stackFixActionContinuationFrame);
    });
}
exports.fixAction = fixAction;
function stackFixActionContinuation(frame) {
    return __awaiter(this, void 0, void 0, function* () {
        (0, utils_1.checkoutBranch)(frame.checkoutBranchName);
    });
}
exports.stackFixActionContinuation = stackFixActionContinuation;
function restackBranch(args) {
    return __awaiter(this, void 0, void 0, function* () {
        const metaStack = new wrapper_classes_1.MetaStackBuilder().upstackInclusiveFromBranchWithParents(args.branch);
        const stackFixActionContinuationFrame = {
            op: 'STACK_FIX_ACTION_CONTINUATION',
            checkoutBranchName: args.branch.name,
        };
        const mergeConflictCallstack = {
            frame: {
                op: 'STACK_FIX',
                sourceBranchName: args.branch.name,
            },
            parent: {
                frame: stackFixActionContinuationFrame,
                parent: args.mergeConflictCallstack,
            },
        };
        yield restackNode({
            node: metaStack.source,
            mergeConflictCallstack: mergeConflictCallstack,
        });
        yield stackFixActionContinuation(stackFixActionContinuationFrame);
    });
}
exports.restackBranch = restackBranch;
function restackNode(args) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        const node = args.node;
        if ((0, utils_1.rebaseInProgress)()) {
            throw new errors_1.RebaseConflictError(`Interactive rebase still in progress, cannot fix (${node.branch.name}).`, args.mergeConflictCallstack);
        }
        const parentBranch = (_a = node.parent) === null || _a === void 0 ? void 0 : _a.branch;
        if (!parentBranch) {
            throw new errors_1.ExitFailedError(`Cannot find parent in stack for (${node.branch.name}), stopping fix`);
        }
        const mergeBase = node.branch.getMetaMergeBase();
        if (!mergeBase) {
            throw new errors_1.ExitFailedError(`Cannot find a merge base in the stack for (${node.branch.name}), stopping fix`);
        }
        if (parentBranch.ref() === mergeBase) {
            (0, utils_1.logInfo)(`No fix needed for (${node.branch.name}) on (${parentBranch.name})`);
        }
        else {
            (0, utils_1.logInfo)(`Fixing (${chalk_1.default.green(node.branch.name)}) on (${parentBranch.name})`);
            (0, utils_1.checkoutBranch)(node.branch.name);
            node.branch.setMetaPrevRef(node.branch.getCurrentRef());
            (0, utils_1.gpExecSync)({
                command: `git rebase --onto ${parentBranch.name} ${mergeBase} ${node.branch.name}`,
                options: { stdio: 'ignore' },
            }, () => {
                if ((0, utils_1.rebaseInProgress)()) {
                    throw new errors_1.RebaseConflictError(`Interactive rebase in progress, cannot fix (${node.branch.name}) onto (${parentBranch.name}).`, args.mergeConflictCallstack);
                }
            });
            config_1.cache.clearAll();
        }
        for (const child of node.children) {
            yield restackNode({
                node: child,
                mergeConflictCallstack: args.mergeConflictCallstack,
            });
        }
    });
}
function regen(branch) {
    return __awaiter(this, void 0, void 0, function* () {
        const trunk = (0, utils_1.getTrunk)();
        if (trunk.name == branch.name) {
            regenAllStacks();
            return;
        }
        const gitStack = new wrapper_classes_1.GitStackBuilder().fullStackFromBranch(branch);
        yield recursiveRegen(gitStack.source);
    });
}
function regenAllStacks() {
    const allGitStacks = new wrapper_classes_1.GitStackBuilder().allStacks();
    (0, utils_1.logInfo)(`Computing regenerating ${allGitStacks.length} stacks...`);
    allGitStacks.forEach((stack) => {
        (0, utils_1.logInfo)(`\nRegenerating:\n${stack.toString()}`);
        recursiveRegen(stack.source);
    });
}
function recursiveRegen(node) {
    var _a;
    // The only time we expect newParent to be undefined is if we're fixing
    // the base branch which is behind trunk.
    const branch = node.branch;
    // Set parents if not trunk
    if (branch.name !== (0, utils_1.getTrunk)().name) {
        const oldParent = branch.getParentFromMeta();
        const newParent = ((_a = node.parent) === null || _a === void 0 ? void 0 : _a.branch) || (0, utils_1.getTrunk)();
        if (oldParent && oldParent.name === newParent.name) {
            (0, utils_1.logInfo)(`-> No change for (${branch.name}) with branch parent (${oldParent.name})`);
        }
        else {
            (0, utils_1.logInfo)(`-> Updating (${branch.name}) branch parent from (${oldParent === null || oldParent === void 0 ? void 0 : oldParent.name}) to (${chalk_1.default.green(newParent.name)})`);
            branch.setParentBranchName(newParent.name);
        }
    }
    node.children.forEach(recursiveRegen);
}
//# sourceMappingURL=fix.js.map