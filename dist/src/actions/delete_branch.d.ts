import { TContext } from '../lib/context';
export declare function deleteBranchAction(args: {
    branchName: string;
    force?: boolean;
}, context: TContext): void;
export declare function isSafeToDelete(branchName: string, context: TContext): {
    result: true;
    reason: string;
} | {
    result: false;
};
