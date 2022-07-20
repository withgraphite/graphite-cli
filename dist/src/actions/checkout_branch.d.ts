import { TContext } from '../lib/context';
export declare function checkoutBranch({ branchName, showUntracked, }: {
    branchName: string | undefined;
    showUntracked?: boolean;
}, context: TContext): Promise<void>;
