import { Stack, stackNodeT } from ".";
import { repoConfig } from "../lib/config";
import { getTrunk } from "../lib/utils";
import Branch from "./branch";

export abstract class AbstractStackBuilder {
  public allStacksFromTrunk(): Stack[] {
    const baseBranches = this.allStackBaseNames();
    return baseBranches.map(this.fullStackFromBranch);
  }

  public fullStackFromBranch = (branch: Branch): Stack => {
    const base = this.getStackBaseBranch(branch);
    return this.downstackFromBranch(base);
  };

  public downstackFromBranch(branch: Branch): Stack {
    const trunkNode: stackNodeT = {
      branch: getTrunk(),
      parents: [],
      children: [],
    };
    const sourceNode: stackNodeT = {
      branch,
      parents: [trunkNode],
      children: [],
    };
    trunkNode.children.push(sourceNode);

    let nodes: stackNodeT[] = [sourceNode];
    do {
      const curNode = nodes.pop();
      if (!curNode) {
        break;
      }
      curNode.children = this.getChildrenForBranch(curNode.branch).map(
        (child) => {
          return { branch: child, parents: [curNode], children: [] };
        }
      );
      nodes = nodes.concat(curNode.children);
    } while (nodes.length > 0);

    return new Stack(trunkNode);
  }

  protected allStackBaseNames(): Branch[] {
    const allBranches = Branch.allBranches();
    const allStackBaseNames = allBranches
      .filter(
        (b) =>
          !repoConfig.getIgnoreBranches().includes(b.name) &&
          b.name != getTrunk().name
      )
      .map((b) => this.getStackBaseBranch(b).name);
    const uniqueStackBaseNames = [...new Set(allStackBaseNames)];
    return uniqueStackBaseNames.map((bn) => new Branch(bn));
  }

  protected abstract getStackBaseBranch(branch: Branch): Branch;
  protected abstract getChildrenForBranch(branch: Branch): Branch[];
}
