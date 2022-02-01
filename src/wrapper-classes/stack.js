"use strict";
exports.__esModule = true;
var branch_1 = require("./branch");
var stack_node_1 = require("./stack_node");
var Stack = /** @class */ (function () {
    function Stack(source) {
        this.source = source;
    }
    Stack.prototype.branches = function () {
        var branches = [this.source.branch];
        this.source.children.forEach(function (c) {
            branches = branches.concat(new Stack(c).branches());
        });
        return branches;
    };
    Stack.prototype.toPromptChoices = function (indent) {
        if (indent === void 0) { indent = 0; }
        var choices = [
            {
                title: '  '.repeat(indent) + "\u21B3 (" + this.source.branch.name + ")",
                value: this.source.branch.name
            },
        ];
        this.source.children.forEach(function (c) {
            choices = choices.concat(new Stack(c).toPromptChoices(indent + 1));
        });
        return choices;
    };
    Stack.prototype.toString = function () {
        var indentMultilineString = function (lines) {
            return lines
                .split('\n')
                .map(function (l) { return '  ' + l; })
                .join('\n');
        };
        return ["\u21B3 (" + this.source.branch.name + ")"]
            .concat(this.source.children
            .map(function (c) { return new Stack(c).toString(); })
            .map(indentMultilineString))
            .join('\n');
    };
    Stack.prototype.toDictionary = function () {
        return this.source.toDictionary();
    };
    Stack.prototype.equals = function (other) {
        return this.base().equals(other.base());
    };
    Stack.prototype.base = function () {
        var base = this.source;
        while (base.parent) {
            base = base.parent;
        }
        return base;
    };
    Stack.fromMap = function (map) {
        if (Object.keys(map).length != 1) {
            throw Error("Map must have only only top level branch name");
        }
        var sourceBranchName = Object.keys(map)[0];
        var sourceNode = new stack_node_1["default"]({
            branch: new branch_1["default"](sourceBranchName),
            parent: undefined,
            children: []
        });
        sourceNode.children = stack_node_1["default"].childrenNodesFromMap(sourceNode, map[sourceBranchName]);
        return new Stack(sourceNode);
    };
    return Stack;
}());
exports["default"] = Stack;
