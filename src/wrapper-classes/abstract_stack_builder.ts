import { Stack, StackNode } from ".";
import Branch from "./branch";

export default abstract class AbstractStackBuilder {
  useMemoizedResults: boolean;

  constructor(opts?: { useMemoizedResults: boolean }) {
    this.useMemoizedResults = opts?.useMemoizedResults || false;
  }

  public allStacksFromTrunk(): Stack[] {
    const baseBranches = this.allStackBaseNames();
    return baseBranches.map(this.fullStackFromBranch);
  }

  public abstract fullStackFromBranch(branch: Branch): Stack;

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

  protected allStackBaseNames(): Branch[] {
    const allBranches = Branch.allBranches({
      useMemoizedResults: this.useMemoizedResults,
    });
    const allStackBaseNames = allBranches.map(
      (b) => this.getStackBaseBranch(b).name
    );
    const uniqueStackBaseNames = [...new Set(allStackBaseNames)];
    return uniqueStackBaseNames.map(
      (bn) => new Branch(bn, { useMemoizedResults: this.useMemoizedResults })
    );
  }

  protected abstract getStackBaseBranch(branch: Branch): Branch;
  protected abstract getChildrenForBranch(branch: Branch): Branch[];
  protected abstract getParentForBranch(branch: Branch): Branch | undefined;
}
