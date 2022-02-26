import Branch from '../../wrapper-classes/branch';
import { TContext } from './../context/context';
export declare function getBranchChildrenOrParentsFromGit(branch: Branch, opts: {
    direction: 'children' | 'parents';
    useMemoizedResults?: boolean;
}, context: TContext): Branch[];
export declare function getRevListGitTree(opts: {
    useMemoizedResults: boolean;
    direction: 'parents' | 'children';
}, context: TContext): Record<string, string[]>;
