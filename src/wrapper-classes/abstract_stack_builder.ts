import { Stack, StackNode } from ".";
import { getTrunk } from "../lib/utils";
import Branch from "./branch";

export default abstract class AbstractStackBuilder {
  useMemoizedResults: boolean;

  constructor(opts?: { useMemoizedResults: boolean }) {
    this.useMemoizedResults = opts?.useMemoizedResults || false;
  }

  public allStacks(): Stack[] {
    const baseBranches = this.allStackBaseNames();
    return baseBranches.map(this.fullStackFromBranch);
  }

  public upstackInclusiveFromBranchWithParents(branch: Branch): Stack {
    const stack = this.fullStackFromBranch(branch);

    // Traverse to find the source node and set;
    let possibleSourceNodes = [stack.source];
    while (possibleSourceNodes.length > 0) {
      const node = possibleSourceNodes.pop();
      if (!node) {
        throw new Error("Stack missing source node, shouldnt happen");
      }
      if (node.branch.name === branch.name) {
        stack.source = node;
        break;
      }
      possibleSourceNodes = possibleSourceNodes.concat(node.children);
    }
    return stack;
  }

  public upstackInclusiveFromBranchWithoutParents(branch: Branch): Stack {
    const sourceNode: StackNode = new StackNode({
      branch,
      parent: undefined,
      children: [],
    });

    let nodes: StackNode[] = [sourceNode];
    do {
      const curNode = nodes.pop();
      if (!curNode) {
        break;
      }
      curNode.children = this.getChildrenForBranch(curNode.branch).map(
        (child) => {
          return new StackNode({
            branch: child,
            parent: curNode,
            children: [],
          });
        }
      );
      nodes = nodes.concat(curNode.children);
    } while (nodes.length > 0);

    return new Stack(sourceNode);
  }

  private allStackBaseNames(): Branch[] {
    const allBranches = Branch.allBranches({
      useMemoizedResults: this.useMemoizedResults,
    });
    const allStackBaseNames = allBranches.map(
      (b) => this.getStackBaseBranch(b, { excludingTrunk: false }).name
    );
    const uniqueStackBaseNames = [...new Set(allStackBaseNames)];
    return uniqueStackBaseNames.map(
      (bn) => new Branch(bn, { useMemoizedResults: this.useMemoizedResults })
    );
  }

  public fullStackFromBranch = (branch: Branch): Stack => {
    const base = this.getStackBaseBranch(branch, { excludingTrunk: true });
    const stack = this.upstackInclusiveFromBranchWithoutParents(base);

    if (branch.name == getTrunk().name) {
      return stack;
    }

    // If the parent is trunk (the only possibility because this is a off trunk)
    const parent = this.getBranchParent(branch);
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

  private getStackBaseBranch(
    branch: Branch,
    opts: { excludingTrunk: boolean }
  ): Branch {
    const parent = this.getBranchParent(branch);
    if (!parent) {
      return branch;
    }
    if (opts?.excludingTrunk && parent.isTrunk()) {
      return branch;
    }
    return this.getStackBaseBranch(parent, opts);
  }

  protected abstract getBranchParent(branch: Branch): Branch | undefined;
  protected abstract getChildrenForBranch(branch: Branch): Branch[];
  protected abstract getParentForBranch(branch: Branch): Branch | undefined;
}
