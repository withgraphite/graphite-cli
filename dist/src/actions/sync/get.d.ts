import { TContext } from '../../lib/context';
export declare function getAction(args: {
    branchName: string | undefined;
    force: boolean;
}, context: TContext): Promise<void>;
export declare function getBranchesFromRemote(args: {
    downstack: string[];
    base: string;
    force: boolean;
}, context: TContext): Promise<void>;
