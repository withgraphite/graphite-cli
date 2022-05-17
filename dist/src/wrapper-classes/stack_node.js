"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StackNode = void 0;
const branch_1 = require("./branch");
class StackNode {
    constructor(opts) {
        this.branch = opts.branch;
        this.parent = opts.parent || undefined;
        this.children = opts.children || [];
    }
    equals(other) {
        var _a, _b;
        if (this.branch.name !== other.branch.name) {
            return false;
        }
        if (this.children.length === 0 && other.children.length === 0) {
            return true;
        }
        if (this.children
            .map((c) => c.branch.name)
            .sort()
            .join(' ') !==
            other.children
                .map((c) => c.branch.name)
                .sort()
                .join(' ')) {
            return false;
        }
        if (((_a = this.parent) === null || _a === void 0 ? void 0 : _a.branch.name) !== ((_b = other.parent) === null || _b === void 0 ? void 0 : _b.branch.name)) {
            return false;
        }
        return this.children.every((c) => {
            return c.equals(
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            other.children.find((bc) => bc.branch.name == c.branch.name));
        });
    }
    static childrenNodesFromMap(parent, map) {
        if (!map) {
            return [];
        }
        return Object.keys(map).map((branchName) => {
            const node = new StackNode({
                branch: new branch_1.Branch(branchName),
                parent: parent,
                children: [],
            });
            node.children = StackNode.childrenNodesFromMap(node, map[branchName]);
            return node;
        });
    }
}
exports.StackNode = StackNode;
//# sourceMappingURL=stack_node.js.map