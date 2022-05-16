import { Branch } from '../../wrapper-classes/branch';
import { TContext } from '../context';
export declare function syncPRInfoForBranches(branches: Branch[], context: TContext): Promise<void>;
export declare function syncPRInfoForBranchByName(branchNames: string[], context: TContext): Promise<void>;
