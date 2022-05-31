"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AbstractStackBuilder = void 0;
const trunk_1 = require("../lib/utils/trunk");
const branch_1 = require("./branch");
const stack_1 = require("./stack");
const stack_node_1 = require("./stack_node");
class AbstractStackBuilder {
    constructor(opts) {
        /*
          This function traverses the tree downstack, ie, from the branch to all its
          ancestors until it hits trunk (which has no parent)
         */
        this.downstackFromBranch = (b, context) => {
            const branch = this.memoizeBranchIfNeeded(b);
            let node = new stack_node_1.StackNode({ branch });
            let parent = this.getBranchParent(node.branch, context);
            while (parent) {
                node.parent = new stack_node_1.StackNode({ branch: parent, children: [node] });
                node = node.parent;
                parent = this.getBranchParent(node.branch, context);
            }
            return new stack_1.Stack(node);
        };
        this.fullStackFromBranch = (b, context) => {
            const branch = this.memoizeBranchIfNeeded(b);
            context.splog.logDebug(`Finding base branch of stack with ${branch.name}`);
            const base = this.getStackBaseBranch(branch, { excludingTrunk: true }, context);
            context.splog.logDebug(`Finding rest of stack from base branch of stack with ${branch.name}`);
            const stack = this.upstackInclusiveFromBranchWithoutParents(base, context);
            if (branch.name == trunk_1.getTrunk(context).name) {
                return stack;
            }
            // If the parent is trunk (the only possibility because this is a off trunk)
            const parent = this.getBranchParent(stack.source.branch, context);
            if (parent && parent.name == trunk_1.getTrunk(context).name) {
                const trunkNode = new stack_node_1.StackNode({
                    branch: trunk_1.getTrunk(context),
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
    getStack(args, context) {
        return {
            UPSTACK: () => this.upstackInclusiveFromBranchWithoutParents(args.currentBranch, context),
            DOWNSTACK: () => this.downstackFromBranch(args.currentBranch, context),
            FULLSTACK: () => this.fullStackFromBranch(args.currentBranch, context),
        }[args.scope]();
    }
    memoizeBranchIfNeeded(branch) {
        return this.useMemoizedResults
            ? new branch_1.Branch(branch.name, {
                useMemoizedResults: true,
            })
            : branch;
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
        const sourceNode = new stack_node_1.StackNode({
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
            context.splog.logDebug(`Looking up children for ${curNode.branch.name}...`);
            const unvisitedChildren = this.getChildrenForBranch(curNode.branch, context)
                .filter((child) => !visitedBranches.includes(child.name))
                .map((child) => {
                return new stack_node_1.StackNode({
                    branch: child,
                    parent: curNode,
                    children: [],
                });
            });
            curNode.children = unvisitedChildren;
            nodes = nodes.concat(curNode.children);
        } while (nodes.length > 0);
        return new stack_1.Stack(sourceNode);
    }
    allStackBaseNames(context) {
        context.splog.logDebug(`Getting all branches...`);
        const allBranches = branch_1.Branch.allBranches(context, {
            useMemoizedResults: this.useMemoizedResults,
        });
        context.splog.logDebug(`Got ${allBranches.length} branches`);
        context.splog.logDebug(`Getting all stack base names...`);
        const allStackBaseNames = allBranches.map((b) => this.getStackBaseBranch(b, { excludingTrunk: false }, context).name);
        const uniqueStackBaseNames = [...new Set(allStackBaseNames)];
        context.splog.logDebug(`Got ${uniqueStackBaseNames.length} stack base names...`);
        return uniqueStackBaseNames.map((bn) => new branch_1.Branch(bn, { useMemoizedResults: this.useMemoizedResults }));
    }
    getStackBaseBranch(branch, opts, context) {
        context.splog.logDebug(`Getting base branch for ${branch.name}...`);
        const parent = this.getBranchParent(branch, context);
        if (!parent || ((opts === null || opts === void 0 ? void 0 : opts.excludingTrunk) && parent.isTrunk(context))) {
            context.splog.logDebug(`Base branch is ${branch.name}`);
            return branch;
        }
        return this.getStackBaseBranch(parent, opts, context);
    }
}
exports.AbstractStackBuilder = AbstractStackBuilder;
//# sourceMappingURL=abstract_stack_builder.js.map