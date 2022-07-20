import { TContext } from '../../lib/context';
export declare function validateBranchesToSubmit(branchNames: string[], context: TContext): Promise<string[]>;
export declare function validateNoEmptyBranches(branchNames: string[], context: TContext): Promise<void>;
