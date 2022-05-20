import { TContext } from '../lib/context';
import { Branch } from '../wrapper-classes/branch';
declare type TPrintStackConfig = {
    currentBranchName?: string;
    offTrunk: boolean;
    visited: string[];
};
export declare function printStack(args: {
    baseBranch: Branch;
    indentLevel: number;
    config: TPrintStackConfig;
}, context: TContext): void;
export declare function getBranchTitle(branch: Branch, config: TPrintStackConfig): string;
export {};
