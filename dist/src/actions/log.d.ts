import { TContext } from '../lib/context';
export declare function logAction(opts: {
    style: 'SHORT' | 'FULL';
    reverse: boolean;
    steps: number | undefined;
    branchName: string;
    showUntracked?: boolean;
}, context: TContext): void;
export declare function logForConflictStatus(rebaseHead: string, context: TContext): void;
export declare function interactiveBranchSelection(opts: {
    message: string;
    omitCurrentBranch?: boolean;
    showUntracked?: boolean;
}, context: TContext): Promise<string>;
