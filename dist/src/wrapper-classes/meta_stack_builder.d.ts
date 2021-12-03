import { AbstractStackBuilder } from ".";
import Branch from "./branch";
export default class MetaStackBuilder extends AbstractStackBuilder {
    protected getBranchParent(branch: Branch): Branch | undefined;
    protected getChildrenForBranch(branch: Branch): Branch[];
    protected getParentForBranch(branch: Branch): Branch | undefined;
}
