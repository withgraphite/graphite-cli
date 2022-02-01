"use strict";
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
exports.__esModule = true;
var _1 = require(".");
var utils_1 = require("../lib/utils");
var branch_1 = require("./branch");
var AbstractStackBuilder = /** @class */ (function () {
    function AbstractStackBuilder(opts) {
        var _this = this;
        /*
          This function traverses the tree downstack, ie, from the branch to all its
          ancestors until it hits trunk (which has no parent)
         */
        this.downstackFromBranch = function (b) {
            var branch = _this.memoizeBranchIfNeeded(b);
            var node = new _1.StackNode({ branch: branch });
            var parent = _this.getBranchParent(node.branch);
            while (parent) {
                node.parent = new _1.StackNode({ branch: parent, children: [node] });
                node = node.parent;
                parent = _this.getBranchParent(node.branch);
            }
            return new _1.Stack(node);
        };
        this.fullStackFromBranch = function (b) {
            var branch = _this.memoizeBranchIfNeeded(b);
            utils_1.logDebug("Finding base branch of stack with " + branch.name);
            var base = _this.getStackBaseBranch(branch, { excludingTrunk: true });
            utils_1.logDebug("Finding rest of stack from base branch of stack with " + branch.name);
            var stack = _this.upstackInclusiveFromBranchWithoutParents(base);
            if (branch.name == utils_1.getTrunk().name) {
                return stack;
            }
            // If the parent is trunk (the only possibility because this is a off trunk)
            var parent = _this.getBranchParent(stack.source.branch);
            if (parent && parent.name == utils_1.getTrunk().name) {
                var trunkNode = new _1.StackNode({
                    branch: utils_1.getTrunk(),
                    parent: undefined,
                    children: [stack.source]
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
    AbstractStackBuilder.prototype.allStacks = function () {
        var baseBranches = this.allStackBaseNames();
        return baseBranches.map(this.fullStackFromBranch);
    };
    AbstractStackBuilder.prototype.memoizeBranchIfNeeded = function (branch) {
        var b = branch;
        if (this.useMemoizedResults) {
            b = new branch_1["default"](branch.name, {
                useMemoizedResults: true
            });
        }
        return b;
    };
    AbstractStackBuilder.prototype.upstackInclusiveFromBranchWithParents = function (b) {
        var branch = this.memoizeBranchIfNeeded(b);
        var stack = this.fullStackFromBranch(branch);
        // Traverse to find the source node and set;
        var possibleSourceNodes = [stack.source];
        while (possibleSourceNodes.length > 0) {
            var node = possibleSourceNodes.pop();
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
    };
    /*
      This function traverses the tree upstack, ie, from the branch to all its
      children until it hits leaf nodes (which have no children)
     */
    AbstractStackBuilder.prototype.upstackInclusiveFromBranchWithoutParents = function (b) {
        var branch = this.memoizeBranchIfNeeded(b);
        var sourceNode = new _1.StackNode({
            branch: branch,
            parent: undefined,
            children: []
        });
        var nodes = [sourceNode];
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
        var visitedBranches = [];
        var _loop_1 = function () {
            var curNode = nodes.pop();
            if (!curNode) {
                return "break";
            }
            visitedBranches.push(curNode.branch.name);
            utils_1.logDebug("Looking up children for " + curNode.branch.name + "...");
            var unvisitedChildren = this_1.getChildrenForBranch(curNode.branch)
                .filter(function (child) { return !visitedBranches.includes(child.name); })
                .map(function (child) {
                return new _1.StackNode({
                    branch: child,
                    parent: curNode,
                    children: []
                });
            });
            curNode.children = unvisitedChildren;
            nodes = nodes.concat(curNode.children);
        };
        var this_1 = this;
        do {
            var state_1 = _loop_1();
            if (state_1 === "break")
                break;
        } while (nodes.length > 0);
        return new _1.Stack(sourceNode);
    };
    AbstractStackBuilder.prototype.allStackBaseNames = function () {
        var _this = this;
        var allBranches = branch_1["default"].allBranches({
            useMemoizedResults: this.useMemoizedResults
        });
        var allStackBaseNames = allBranches.map(function (b) { return _this.getStackBaseBranch(b, { excludingTrunk: false }).name; });
        var uniqueStackBaseNames = __spreadArrays(new Set(allStackBaseNames));
        return uniqueStackBaseNames.map(function (bn) { return new branch_1["default"](bn, { useMemoizedResults: _this.useMemoizedResults }); });
    };
    AbstractStackBuilder.prototype.getStackBaseBranch = function (branch, opts) {
        var parent = this.getBranchParent(branch);
        if (!parent) {
            return branch;
        }
        if ((opts === null || opts === void 0 ? void 0 : opts.excludingTrunk) && parent.isTrunk()) {
            return branch;
        }
        return this.getStackBaseBranch(parent, opts);
    };
    return AbstractStackBuilder;
}());
exports["default"] = AbstractStackBuilder;
