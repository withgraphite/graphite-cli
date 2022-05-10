import { TScope } from '../actions/scope';
import { TContext } from '../lib/context';
import { Branch } from './branch';
import { Stack } from './stack';
export declare abstract class AbstractStackBuilder {
    useMemoizedResults: boolean;
    constructor(opts?: {
        useMemoizedResults: boolean;
    });
    allStacks(context: TContext): Stack[];
    getStack(args: {
        currentBranch: Branch;
        scope: TScope;
    }, context: TContext): Stack;
    private memoizeBranchIfNeeded;
    upstackInclusiveFromBranchWithParents(b: Branch, context: TContext): Stack;
    upstackInclusiveFromBranchWithoutParents(b: Branch, context: TContext): Stack;
    private allStackBaseNames;
    downstackFromBranch: (b: Branch, context: TContext) => Stack;
    fullStackFromBranch: (b: Branch, context: TContext) => Stack;
    private getStackBaseBranch;
    protected abstract getBranchParent(branch: Branch, context: TContext): Branch | undefined;
    protected abstract getChildrenForBranch(branch: Branch, context: TContext): Branch[];
    protected abstract getParentForBranch(branch: Branch, context: TContext): Branch | undefined;
}
