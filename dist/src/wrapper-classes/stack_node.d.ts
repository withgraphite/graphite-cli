import { Branch } from './branch';
export declare type StackMap = {
    [key: string]: StackMap | undefined;
};
export declare class StackNode {
    branch: Branch;
    parent?: StackNode;
    children: StackNode[];
    constructor(opts: {
        branch: Branch;
        parent?: StackNode;
        children?: StackNode[];
    });
    equals(other: StackNode): boolean;
    static childrenNodesFromMap(parent: StackNode, map?: StackMap): StackNode[];
}
