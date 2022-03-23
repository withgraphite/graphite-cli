import { AbstractStackBuilder } from '.';
import { TContext } from '../lib/context/context';
import { Branch } from './branch';
export declare class GitStackBuilder extends AbstractStackBuilder {
    protected getBranchParent(branch: Branch, context: TContext): Branch | undefined;
    protected getChildrenForBranch(branch: Branch, context: TContext): Branch[];
    protected getParentForBranch(branch: Branch, context: TContext): Branch | undefined;
    private checkSiblingBranches;
}
