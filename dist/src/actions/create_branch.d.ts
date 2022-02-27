import { TContext } from '../lib/context/context';
export declare function createBranchAction(opts: {
    branchName?: string;
    commitMessage?: string;
    addAll?: boolean;
}, context: TContext): Promise<void>;
