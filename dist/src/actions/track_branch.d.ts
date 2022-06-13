import { TContext } from '../lib/context';
export declare function trackBranchInteractive(parentBranchName: string, context: TContext): Promise<boolean>;
export declare function trackBranch({ branchName, parentBranchName, force, }: {
    branchName: string;
    parentBranchName: string;
    force?: boolean;
}, context: TContext): Promise<void>;
