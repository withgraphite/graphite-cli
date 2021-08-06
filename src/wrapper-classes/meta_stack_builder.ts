import { AbstractStackBuilder, Stack, stackNodeT } from ".";
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
    const stack = this.upstackInclusiveFromBranch(base);

    if (branch.name == getTrunk().name) {
      return stack;
    }

    const trunkNode: stackNodeT = {
      branch: getTrunk(),
      parents: [],
      children: [stack.source],
    };
    stack.source.parents = [trunkNode];
    stack.source = trunkNode;
    return stack;
  };

  protected getChildrenForBranch(branch: Branch): Branch[] {
    return branch.getChildrenFromMeta();
  }
}
