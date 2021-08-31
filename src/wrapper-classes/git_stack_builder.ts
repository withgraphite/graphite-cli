import { AbstractStackBuilder, Branch } from ".";
import { MultiParentError, SiblingBranchError } from "../lib/errors";

export default class GitStackBuilder extends AbstractStackBuilder {
  protected getBranchParent(branch: Branch): Branch | undefined {
    return branch.getParentsFromGit()[0];
  }

  protected getChildrenForBranch(branch: Branch): Branch[] {
    this.checkSiblingBranches(branch);
    return branch.getChildrenFromGit();
  }

  protected getParentForBranch(branch: Branch): Branch | undefined {
    this.checkSiblingBranches(branch);
    const parents = branch.getParentsFromGit();
    if (parents.length > 1) {
      throw new MultiParentError(branch, parents);
    }
    return parents[0];
  }

  private checkSiblingBranches(branch: Branch): void {
    const siblingBranches = branch.branchesWithSameCommit();
    if (siblingBranches.length > 0) {
      throw new SiblingBranchError([branch].concat(siblingBranches));
    }
  }
}
