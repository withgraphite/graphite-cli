import { TContext } from '../../lib/context/context';
import { Branch } from '../../wrapper-classes/branch';
import { TSubmitScope } from './submit';
export declare function getValidBranchesToSubmit(scope: TSubmitScope, context: TContext): Promise<Branch[]>;
export declare function checkForEmptyBranches(submittableBranches: Branch[], context: TContext): Promise<Branch[]>;
