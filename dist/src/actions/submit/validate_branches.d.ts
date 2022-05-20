import { TContext } from '../../lib/context';
import { Branch } from '../../wrapper-classes/branch';
import { TSubmitScope } from './submit_action';
export declare function getValidBranchesToSubmit(scope: TSubmitScope, context: TContext): Promise<Branch[]>;
export declare function checkForEmptyBranches(submittableBranches: Branch[], context: TContext): Promise<Branch[]>;
