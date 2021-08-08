import { AbstractStackBuilder, Stack, StackNode } from ".";
import { getTrunk, gpExecSync } from "../lib/utils";
import Branch from "./branch";

export class GitStackBuilder extends AbstractStackBuilder {
  public fullStackFromBranch = (branch: Branch): Stack => {
    const base = this.getStackBaseBranch(branch);
    const stack = this.upstackInclusiveFromBranchWithoutParents(base);

    const parents = branch.getParentsFromGit();

    // If the parent isnt trunk, just return.
    if (parents[0]?.name !== getTrunk().name) {
      return stack;
    }

    const trunkNode: StackNode = new StackNode({
      branch: getTrunk(),
      parents: [],
      children: [stack.source],
    });
    stack.source.parents = [trunkNode];
    stack.source = trunkNode;
    return stack;
  };

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

  protected getParentsForBranch(branch: Branch): Branch[] {
    return branch.getParentsFromGit();
  }
}
