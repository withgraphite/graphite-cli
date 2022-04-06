"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AbstractStackBuilder = void 0;
const _1 = require(".");
const utils_1 = require("../lib/utils");
const branch_1 = require("./branch");
class AbstractStackBuilder {
    constructor(opts) {
        /*
          This function traverses the tree downstack, ie, from the branch to all its
          ancestors until it hits trunk (which has no parent)
         */
        this.downstackFromBranch = (b, context) => {
            const branch = this.memoizeBranchIfNeeded(b);
            let node = new _1.StackNode({ branch });
            let parent = this.getBranchParent(node.branch, context);
            while (parent) {
                node.parent = new _1.StackNode({ branch: parent, children: [node] });
                node = node.parent;
                parent = this.getBranchParent(node.branch, context);
            }
            return new _1.Stack(node);
        };
        this.fullStackFromBranch = (b, context) => {
            const branch = this.memoizeBranchIfNeeded(b);
            utils_1.logDebug(`Finding base branch of stack with ${branch.name}`);
            const base = this.getStackBaseBranch(branch, { excludingTrunk: true }, context);
            utils_1.logDebug(`Finding rest of stack from base branch of stack with ${branch.name}`);
            const stack = this.upstackInclusiveFromBranchWithoutParents(base, context);
            if (branch.name == utils_1.getTrunk(context).name) {
                return stack;
            }
            // If the parent is trunk (the only possibility because this is a off trunk)
            const parent = this.getBranchParent(stack.source.branch, context);
            if (parent && parent.name == utils_1.getTrunk(context).name) {
                const trunkNode = new _1.StackNode({
                    branch: utils_1.getTrunk(context),
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
    allStacks(context) {
        const baseBranches = this.allStackBaseNames(context);
        return baseBranches.map((b) => this.fullStackFromBranch(b, context));
    }
    memoizeBranchIfNeeded(branch) {
        let b = branch;
        if (this.useMemoizedResults) {
            b = new branch_1.Branch(branch.name, {
                useMemoizedResults: true,
            });
        }
        return b;
    }
    upstackInclusiveFromBranchWithParents(b, context) {
        const branch = this.memoizeBranchIfNeeded(b);
        const stack = this.fullStackFromBranch(branch, context);
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
    upstackInclusiveFromBranchWithoutParents(b, context) {
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
            utils_1.logDebug(`Looking up children for ${curNode.branch.name}...`);
            const unvisitedChildren = this.getChildrenForBranch(curNode.branch, context)
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
    allStackBaseNames(context) {
        const allBranches = branch_1.Branch.allBranches(context, {
            useMemoizedResults: this.useMemoizedResults,
        });
        const allStackBaseNames = allBranches.map((b) => this.getStackBaseBranch(b, { excludingTrunk: false }, context).name);
        const uniqueStackBaseNames = [...new Set(allStackBaseNames)];
        return uniqueStackBaseNames.map((bn) => new branch_1.Branch(bn, { useMemoizedResults: this.useMemoizedResults }));
    }
    getStackBaseBranch(branch, opts, context) {
        const parent = this.getBranchParent(branch, context);
        if (!parent) {
            return branch;
        }
        if ((opts === null || opts === void 0 ? void 0 : opts.excludingTrunk) && parent.isTrunk(context)) {
            return branch;
        }
        return this.getStackBaseBranch(parent, opts, context);
    }
}
exports.AbstractStackBuilder = AbstractStackBuilder;
//# sourceMappingURL=abstract_stack_builder.js.map