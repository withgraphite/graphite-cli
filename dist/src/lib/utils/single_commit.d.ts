import { Branch } from '../../wrapper-classes/branch';
import { Commit } from '../../wrapper-classes/commit';
import { TContext } from '../context';
export declare function getSingleCommitOnBranch(branch: Branch, context: TContext): Commit | null;
