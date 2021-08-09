import { AbstractStackBuilder, Stack, StackNode } from ".";
import { getTrunk } from "../lib/utils";
import Branch from "./branch";

export class MetaStackBuilder extends AbstractStackBuilder {
  protected getStackBaseBranch(branch: Branch): Branch {
    const parent = branch.getParentFromMeta();
    if (!parent) {
      return branch;
    }
    if (parent.name == getTrunk().name) {
      return branch;
    }
    return this.getStackBaseBranch(parent);
  }

  public fullStackFromBranch = (branch: Branch): Stack => {
    const base = this.getStackBaseBranch(branch);
    const stack = this.upstackInclusiveFromBranchWithoutParents(base);

    if (branch.name == getTrunk().name) {
      return stack;
    }

    // If the parent is trunk (the only possibility because this is a off trunk)
    const parent = base.getParentFromMeta();
    if (parent && parent.name == getTrunk().name) {
      const trunkNode: StackNode = new StackNode({
        branch: getTrunk(),
        parent: undefined,
        children: [stack.source],
      });
      stack.source.parent = trunkNode;
      stack.source = trunkNode;
    } else {
      // To get in this state, the user must likely have changed their trunk branch...
    }
    return stack;
  };

  protected getChildrenForBranch(branch: Branch): Branch[] {
    return branch.getChildrenFromMeta();
  }

  protected getParentForBranch(branch: Branch): Branch | undefined {
    return branch.getParentFromMeta();
  }
}
