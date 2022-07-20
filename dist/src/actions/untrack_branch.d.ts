import { TContext } from '../lib/context';
export declare function untrackBranch({ branchName, force }: {
    branchName: string;
    force: boolean;
}, context: TContext): Promise<void>;
