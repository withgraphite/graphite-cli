import { TContext } from '../../lib/context';
export declare function getAction(branchName: string, context: TContext): Promise<void>;
export declare function getBranchesFromRemote(downstack: string[], base: string, context: TContext): Promise<void>;
