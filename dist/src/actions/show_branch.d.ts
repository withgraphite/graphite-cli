import { TContext } from '../lib/context';
export declare function showBranchAction(branchName: string, opts: {
    patch: boolean;
    description: boolean;
}, context: TContext): Promise<void>;
export declare function getBranchInfo(args: {
    branchName: string;
    displayAsCurrent?: boolean;
    showCommitNames?: 'STANDARD' | 'REVERSE';
}, context: TContext): string[];
