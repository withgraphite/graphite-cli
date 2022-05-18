import { TContext } from '../lib/context';
export declare function createBranchAction(opts: {
    branchName?: string;
    commitMessage?: string;
    addAll?: boolean;
    restack?: boolean;
}, context: TContext): Promise<void>;
