"use strict";
exports.__esModule = true;
var branch_1 = require("./branch");
var StackNode = /** @class */ (function () {
    function StackNode(opts) {
        this.branch = opts.branch;
        this.parent = opts.parent || undefined;
        this.children = opts.children || [];
    }
    StackNode.prototype.equals = function (other) {
        var _a, _b;
        if (this.branch.name !== other.branch.name) {
            return false;
        }
        if (this.children.length === 0 && other.children.length === 0) {
            return true;
        }
        if (this.children
            .map(function (c) { return c.branch.name; })
            .sort()
            .join(' ') !==
            other.children
                .map(function (c) { return c.branch.name; })
                .sort()
                .join(' ')) {
            return false;
        }
        if (((_a = this.parent) === null || _a === void 0 ? void 0 : _a.branch.name) !== ((_b = other.parent) === null || _b === void 0 ? void 0 : _b.branch.name)) {
            return false;
        }
        return this.children.every(function (c) {
            return c.equals(
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            other.children.find(function (bc) { return bc.branch.name == c.branch.name; }));
        });
    };
    StackNode.prototype.toDictionary = function () {
        var _this = this;
        var data = {};
        data[this.branch.name] = {};
        this.children.forEach(function (child) {
            return (data[_this.branch.name][child.branch.name] =
                child.toDictionary()[child.branch.name]);
        });
        return data;
    };
    StackNode.childrenNodesFromMap = function (parent, map) {
        if (!map) {
            return [];
        }
        return Object.keys(map).map(function (branchName) {
            var node = new StackNode({
                branch: new branch_1["default"](branchName),
                parent: parent,
                children: []
            });
            node.children = StackNode.childrenNodesFromMap(node, map[branchName]);
            return node;
        });
    };
    return StackNode;
}());
exports["default"] = StackNode;
