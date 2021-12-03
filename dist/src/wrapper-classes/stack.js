"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const branch_1 = __importDefault(require("./branch"));
const stack_node_1 = __importDefault(require("./stack_node"));
class Stack {
    constructor(source) {
        this.source = source;
    }
    branches() {
        let branches = [this.source.branch];
        this.source.children.forEach((c) => {
            branches = branches.concat(new Stack(c).branches());
        });
        return branches;
    }
    toPromptChoices(indent = 0) {
        let choices = [
            {
                title: `${"  ".repeat(indent)}↳ (${this.source.branch.name})`,
                value: this.source.branch.name,
            },
        ];
        this.source.children.forEach((c) => {
            choices = choices.concat(new Stack(c).toPromptChoices(indent + 1));
        });
        return choices;
    }
    toString() {
        const indentMultilineString = (lines) => lines
            .split("\n")
            .map((l) => "  " + l)
            .join("\n");
        return [`↳ (${this.source.branch.name})`]
            .concat(this.source.children
            .map((c) => new Stack(c).toString())
            .map(indentMultilineString))
            .join("\n");
    }
    toDictionary() {
        return this.source.toDictionary();
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
        const sourceNode = new stack_node_1.default({
            branch: new branch_1.default(sourceBranchName),
            parent: undefined,
            children: [],
        });
        sourceNode.children = stack_node_1.default.childrenNodesFromMap(sourceNode, map[sourceBranchName]);
        return new Stack(sourceNode);
    }
}
exports.default = Stack;
//# sourceMappingURL=stack.js.map