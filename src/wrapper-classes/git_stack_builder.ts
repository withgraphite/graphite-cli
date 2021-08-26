import { AbstractStackBuilder, Branch } from ".";

export default class GitStackBuilder extends AbstractStackBuilder {
  protected getBranchParent(branch: Branch): Branch | undefined {
    return branch.getParentFromGit();
  }

  protected getChildrenForBranch(branch: Branch): Branch[] {
    return branch.getChildrenFromGit();
  }

  protected getParentForBranch(branch: Branch): Branch | undefined {
    return branch.getParentFromGit();
  }
}
