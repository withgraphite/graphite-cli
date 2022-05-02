"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Stack = void 0;
const indent_multiline_string_1 = require("../lib/utils/indent_multiline_string");
const branch_1 = require("./branch");
const stack_node_1 = require("./stack_node");
class Stack {
    constructor(source) {
        this.source = source;
    }
    branches() {
        return this.source.children
            .map((c) => new Stack(c).branches())
            .reduce((acc, arr) => acc.concat(arr), [this.source.branch]);
    }
    toPromptChoices(indent = 0) {
        const currentChoice = {
            title: `${'  '.repeat(indent)}↱ (${this.source.branch.name})`,
            value: this.source.branch.name,
        };
        return this.source.children
            .map((c) => new Stack(c).toPromptChoices(indent + 1))
            .reduceRight((acc, arr) => arr.concat(acc), [currentChoice]);
    }
    toString() {
        return this.source.children
            .map((c) => new Stack(c).toString())
            .map((lines) => indent_multiline_string_1.indentMultilineString(lines, 2))
            .concat([`↱ (${this.source.branch.name})`])
            .join('\n');
    }
    equals(other) {
        return this.base().equals(other.base());
    }
    base() {
        let base = this.source;
        while (base.parent) {
            base = base.parent;
        }
        return base;
    }
    static fromMap(map) {
        if (Object.keys(map).length != 1) {
            throw Error(`Map must have only only top level branch name`);
        }
        const sourceBranchName = Object.keys(map)[0];
        const sourceNode = new stack_node_1.StackNode({
            branch: new branch_1.Branch(sourceBranchName),
            parent: undefined,
            children: [],
        });
        sourceNode.children = stack_node_1.StackNode.childrenNodesFromMap(sourceNode, map[sourceBranchName]);
        return new Stack(sourceNode);
    }
}
exports.Stack = Stack;
//# sourceMappingURL=stack.js.map