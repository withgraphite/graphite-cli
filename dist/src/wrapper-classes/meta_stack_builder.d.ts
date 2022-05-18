import { TContext } from '../lib/context';
import { AbstractStackBuilder } from './abstract_stack_builder';
import { Branch } from './branch';
export declare class MetaStackBuilder extends AbstractStackBuilder {
    protected getBranchParent(branch: Branch, context: TContext): Branch | undefined;
    protected getChildrenForBranch(branch: Branch, context: TContext): Branch[];
    protected getParentForBranch(branch: Branch, context: TContext): Branch | undefined;
}
