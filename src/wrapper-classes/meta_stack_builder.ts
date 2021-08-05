import { AbstractStackBuilder } from ".";
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

  protected getChildrenForBranch(branch: Branch): Branch[] {
    return branch.getChildrenFromMeta();
  }
}
