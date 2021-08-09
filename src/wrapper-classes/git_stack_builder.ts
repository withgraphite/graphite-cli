import { AbstractStackBuilder, Branch, Stack, StackNode } from ".";
import { MultiParentError, SiblingBranchError } from "../lib/errors";
import { getTrunk, gpExecSync } from "../lib/utils";

export class GitStackBuilder extends AbstractStackBuilder {
  public fullStackFromBranch = (branch: Branch): Stack => {
    const base = this.getStackBaseBranch(branch);
    const stack = this.upstackInclusiveFromBranchWithoutParents(base);

    const parents = base.getParentsFromGit();
    const parentsIncludeTrunk = parents
      .map((parent) => parent.name)
      .includes(getTrunk().name);

    // If the parents don't include trunk, just return.
    if (!parentsIncludeTrunk) {
      return stack;
    }

    const trunkNode: StackNode = new StackNode({
      branch: getTrunk(),
      parent: undefined,
      children: [stack.source],
    });
    stack.source.parent = trunkNode;
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
