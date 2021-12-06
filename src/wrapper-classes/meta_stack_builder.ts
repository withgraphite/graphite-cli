import { AbstractStackBuilder } from '.';
import Branch from './branch';

export default class MetaStackBuilder extends AbstractStackBuilder {
  protected getBranchParent(branch: Branch): Branch | undefined {
    return branch.getParentFromMeta();
  }

  protected getChildrenForBranch(branch: Branch): Branch[] {
    return branch.getChildrenFromMeta();
  }

  protected getParentForBranch(branch: Branch): Branch | undefined {
    return branch.getParentFromMeta();
  }
}
