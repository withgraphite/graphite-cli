import { Branch } from './branch';
import { StackMap, StackNode } from './stack_node';
export declare class Stack {
    source: StackNode;
    constructor(source: StackNode);
    branches(): Branch[];
    toPromptChoices(omit?: string, indent?: number): {
        title: string;
        value: string;
    }[];
    toString(): string;
    equals(other: Stack): boolean;
    private base;
    static fromMap(map: StackMap): Stack;
}
