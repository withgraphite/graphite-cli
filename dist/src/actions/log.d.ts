import { TContext } from '../lib/context';
export declare function logAction(opts: {
    style: 'SHORT' | 'FULL';
    reverse: boolean;
    steps: number | undefined;
    branchName: string;
}, context: TContext): void;
export declare function interactiveBranchSelection(opts: {
    message: string;
    omitCurrentBranch?: boolean;
}, context: TContext): Promise<string>;
export declare function displayBranchName(branchName: string, context: TContext): string;
