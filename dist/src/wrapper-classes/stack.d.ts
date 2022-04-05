import { Branch } from './branch';
import { StackNode } from './stack_node';
export declare class Stack {
    source: StackNode;
    constructor(source: StackNode);
    branches(): Branch[];
    toPromptChoices(indent?: number): {
        title: string;
        value: string;
    }[];
    toString(): string;
    toDictionary(): Record<string, any>;
    equals(other: Stack): boolean;
    private base;
    static fromMap(map: Record<string, any>): Stack;
}
