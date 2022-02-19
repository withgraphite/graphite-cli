import { Stack } from '.';
import Branch from './branch';
export default abstract class AbstractStackBuilder {
    useMemoizedResults: boolean;
    constructor(opts?: {
        useMemoizedResults: boolean;
    });
    allStacks(): Stack[];
    private memoizeBranchIfNeeded;
    upstackInclusiveFromBranchWithParents(b: Branch): Stack;
    upstackInclusiveFromBranchWithoutParents(b: Branch): Stack;
    private allStackBaseNames;
    downstackFromBranch: (b: Branch) => Stack;
    fullStackFromBranch: (b: Branch) => Stack;
    private getStackBaseBranch;
    protected abstract getBranchParent(branch: Branch): Branch | undefined;
    protected abstract getChildrenForBranch(branch: Branch): Branch[];
    protected abstract getParentForBranch(branch: Branch): Branch | undefined;
}
