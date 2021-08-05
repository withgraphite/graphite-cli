import { AbstractStackBuilder } from ".";
import { getTrunk, gpExecSync } from "../lib/utils";
import Branch from "./branch";

export class GitStackBuilder extends AbstractStackBuilder {
  protected getStackBaseBranch(branch: Branch): Branch {
    const trunkMergeBase = gpExecSync({
      command: `git merge-base ${getTrunk()} ${branch.name}`,
    })
      .toString()
      .trim();

    let baseBranch: Branch = branch;
    let baseBranchParent = baseBranch.getParentsFromGit()[0]; // TODO: greg - support two parents

    while (
      baseBranchParent !== undefined &&
      baseBranchParent.name !== getTrunk().name &&
      baseBranchParent.isUpstreamOf(trunkMergeBase)
    ) {
      baseBranch = baseBranchParent;
      baseBranchParent = baseBranch.getParentsFromGit()[0];
    }

    return baseBranch;
  }

  protected getChildrenForBranch(branch: Branch): Branch[] {
    return branch.getChildrenFromGit();
  }
}
