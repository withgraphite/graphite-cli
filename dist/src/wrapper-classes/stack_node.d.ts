import Branch from './branch';
export default class StackNode {
    branch: Branch;
    parent?: StackNode;
    children: StackNode[];
    constructor(opts: {
        branch: Branch;
        parent?: StackNode;
        children?: StackNode[];
    });
    equals(other: StackNode): boolean;
    toDictionary(): Record<string, any>;
    static childrenNodesFromMap(parent: StackNode, map?: Record<string, any>): StackNode[];
}
