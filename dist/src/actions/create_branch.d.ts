import { TContext } from '../lib/context';
export declare function createBranchAction(opts: {
    branchName?: string;
    message?: string;
    all?: boolean;
    insert?: boolean;
    patch?: boolean;
}, context: TContext): Promise<void>;
