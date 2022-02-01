"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const _1 = require(".");
const utils_1 = require("../lib/utils");
const branch_1 = __importDefault(require("./branch"));
class AbstractStackBuilder {
    constructor(opts) {
        /*
          This function traverses the tree downstack, ie, from the branch to all its
          ancestors until it hits trunk (which has no parent)
         */
        this.downstackFromBranch = (b) => {
            const branch = this.memoizeBranchIfNeeded(b);
            let node = new _1.StackNode({ branch });
            let parent = this.getBranchParent(node.branch);
            while (parent) {
                node.parent = new _1.StackNode({ branch: parent, children: [node] });
                node = node.parent;
                parent = this.getBranchParent(node.branch);
            }
            return new _1.Stack(node);
        };
        this.fullStackFromBranch = (b) => {
            const branch = this.memoizeBranchIfNeeded(b);
            (0, utils_1.logDebug)(`Finding base branch of stack with ${branch.name}`);
            const base = this.getStackBaseBranch(branch, { excludingTrunk: true });
            (0, utils_1.logDebug)(`Finding rest of stack from base branch of stack with ${branch.name}`);
            const stack = this.upstackInclusiveFromBranchWithoutParents(base);
            if (branch.name == (0, utils_1.getTrunk)().name) {
                return stack;
            }
            // If the parent is trunk (the only possibility because this is a off trunk)
            const parent = this.getBranchParent(stack.source.branch);
            if (parent && parent.name == (0, utils_1.getTrunk)().name) {
                const trunkNode = new _1.StackNode({
                    branch: (0, utils_1.getTrunk)(),
                    parent: undefined,
                    children: [stack.source],
                });
                stack.source.parent = trunkNode;
                stack.source = trunkNode;
            }
            else {
                // To get in this state, the user must likely have changed their trunk branch...
            }
            return stack;
        };
        this.useMemoizedResults = (opts === null || opts === void 0 ? void 0 : opts.useMemoizedResults) || false;
    }
    allStacks() {
        const baseBranches = this.allStackBaseNames();
        return baseBranches.map(this.fullStackFromBranch);
    }
    memoizeBranchIfNeeded(branch) {
        let b = branch;
        if (this.useMemoizedResults) {
            b = new branch_1.default(branch.name, {
                useMemoizedResults: true,
            });
        }
        return b;
    }
    upstackInclusiveFromBranchWithParents(b) {
        const branch = this.memoizeBranchIfNeeded(b);
        const stack = this.fullStackFromBranch(branch);
        // Traverse to find the source node and set;
        let possibleSourceNodes = [stack.source];
        while (possibleSourceNodes.length > 0) {
            const node = possibleSourceNodes.pop();
            if (!node) {
                throw new Error('Stack missing source node, should not happen');
            }
            if (node.branch.name === branch.name) {
                stack.source = node;
                break;
            }
            possibleSourceNodes = possibleSourceNodes.concat(node.children);
        }
        return stack;
    }
    /*
      This function traverses the tree upstack, ie, from the branch to all its
      children until it hits leaf nodes (which have no children)
     */
    upstackInclusiveFromBranchWithoutParents(b) {
        const branch = this.memoizeBranchIfNeeded(b);
        const sourceNode = new _1.StackNode({
            branch,
            parent: undefined,
            children: [],
        });
        let nodes = [sourceNode];
        /**
         * TODO(nicholasyan): In our logic below, we traverse a branch's children
         * to figure out the rest of the stack.
         *
         * However, this works substantially less efficiently/breaks down in the
         * presence of merges.
         *
         * Consider the following (a branch B off of A that's later merged back
         * into C, also off of A):
         *
         * C
         * |\
         * | B
         * |/
         * A
         *
         * In this case, our logic will traverse the subtrees (sub-portions of the
         * "stack") twice - which only gets worse the more merges/more potential
         * paths there are.
         *
         * This is a short-term workaround to at least prevent duplicate traversal
         * in the near-term: we mark already-visited nodes and make sure if we
         * hit an already-visited node, we just skip it.
         */
        const visitedBranches = [];
        do {
            const curNode = nodes.pop();
            if (!curNode) {
                break;
            }
            visitedBranches.push(curNode.branch.name);
            (0, utils_1.logDebug)(`Looking up children for ${curNode.branch.name}...`);
            const unvisitedChildren = this.getChildrenForBranch(curNode.branch)
                .filter((child) => !visitedBranches.includes(child.name))
                .map((child) => {
                return new _1.StackNode({
                    branch: child,
                    parent: curNode,
                    children: [],
                });
            });
            curNode.children = unvisitedChildren;
            nodes = nodes.concat(curNode.children);
        } while (nodes.length > 0);
        return new _1.Stack(sourceNode);
    }
    allStackBaseNames() {
        const allBranches = branch_1.default.allBranches({
            useMemoizedResults: this.useMemoizedResults,
        });
        const allStackBaseNames = allBranches.map((b) => this.getStackBaseBranch(b, { excludingTrunk: false }).name);
        const uniqueStackBaseNames = [...new Set(allStackBaseNames)];
        return uniqueStackBaseNames.map((bn) => new branch_1.default(bn, { useMemoizedResults: this.useMemoizedResults }));
    }
    getStackBaseBranch(branch, opts) {
        const parent = this.getBranchParent(branch);
        if (!parent) {
            return branch;
        }
        if ((opts === null || opts === void 0 ? void 0 : opts.excludingTrunk) && parent.isTrunk()) {
            return branch;
        }
        return this.getStackBaseBranch(parent, opts);
    }
}
exports.default = AbstractStackBuilder;
//# sourceMappingURL=abstract_stack_builder.js.map