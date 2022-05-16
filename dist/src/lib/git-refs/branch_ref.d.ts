import { Branch } from '../../wrapper-classes/branch';
import { TContext } from '../context';
export declare function getBranchToRefMapping(context: TContext): Record<string, string>;
export declare function getRef(branch: Branch, context: TContext): string;
export declare function otherBranchesWithSameCommit(branch: Branch, context: TContext): Branch[];
