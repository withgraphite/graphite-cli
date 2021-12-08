import { Stack, StackNode } from '.';
import { getTrunk, logDebug } from '../lib/utils';
import Branch from './branch';

export default abstract class AbstractStackBuilder {
  useMemoizedResults: boolean;

  constructor(opts?: { useMemoizedResults: boolean }) {
    this.useMemoizedResults = opts?.useMemoizedResults || false;
  }

  public allStacks(): Stack[] {
    const baseBranches = this.allStackBaseNames();
    return baseBranches.map(this.fullStackFromBranch);
  }

  private memoizeBranchIfNeeded(branch: Branch): Branch {
    let b = branch;
    if (this.useMemoizedResults) {
      b = new Branch(branch.name, {
        useMemoizedResults: true,
      });
    }
    return b;
  }

  public upstackInclusiveFromBranchWithParents(b: Branch): Stack {
    const branch = this.memoizeBranchIfNeeded(b);
    const stack = this.fullStackFromBranch(branch);

    // Traverse to find the source node and set;
    let possibleSourceNodes = [stack.source];
    while (possibleSourceNodes.length > 0) {
      const node = possibleSourceNodes.pop();
      if (!node) {
        throw new Error('Stack missing source node, shouldnt happen');
      }
      if (node.branch.name === branch.name) {
        stack.source = node;
        break;
      }
      possibleSourceNodes = possibleSourceNodes.concat(node.children);
    }
    return stack;
  }

  public upstackInclusiveFromBranchWithoutParents(b: Branch): Stack {
    const branch = this.memoizeBranchIfNeeded(b);
    const sourceNode: StackNode = new StackNode({
      branch,
      parent: undefined,
      children: [],
    });

    let nodes: StackNode[] = [sourceNode];

    /**
     * TODO(nicholasyan): In our logic below, we traverse a branch's children
     * to figure out the rest of the stack.
     *
     * However, this works substantially less efficiently/breaks down in the
     * presence of merges.
     *
     * Consider the following (a branch B off of A that's later merged back
     * into C, also off of A):
     *
     * C
     * |\
     * | B
     * |/
     * A
     *
     * In this case, our logic will traverse the subtrees (sub-portions of the
     * "stack") twice - which only gets worse the more merges/more potential
     * paths there are.
     *
     * This is a short-term workaround to at least prevent duplicate traversal
     * in the near-term: we mark already-visited nodes and make sure if we
     * hit an already-visited node, we just skip it.
     */
    const visitedBranches: string[] = [];

    do {
      const curNode = nodes.pop();
      if (!curNode) {
        break;
      }

      visitedBranches.push(curNode.branch.name);

      logDebug(`Looking up children for ${curNode.branch.name}...`);
      const unvisitedChildren = this.getChildrenForBranch(curNode.branch)
        .filter((child) => !visitedBranches.includes(child.name))
        .map((child) => {
          return new StackNode({
            branch: child,
            parent: curNode,
            children: [],
          });
        });

      curNode.children = unvisitedChildren;
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

  public downstackFromBranch = (b: Branch): Stack => {
    const branch = this.memoizeBranchIfNeeded(b);
    let node = new StackNode({ branch });
    let parent = branch.getParentFromMeta();
    while (parent) {
      node.parent = new StackNode({ branch: parent });
      node.parent.children = [node];
      node = node.parent;
      parent = parent.getParentFromMeta();
    }
    return new Stack(node);
  };

  public fullStackFromBranch = (b: Branch): Stack => {
    const branch = this.memoizeBranchIfNeeded(b);

    logDebug(`Finding base branch of stack with ${branch.name}`);
    const base = this.getStackBaseBranch(branch, { excludingTrunk: true });

    logDebug(
      `Finding rest of stack from base branch of stack with ${branch.name}`
    );
    const stack = this.upstackInclusiveFromBranchWithoutParents(base);

    if (branch.name == getTrunk().name) {
      return stack;
    }

    // If the parent is trunk (the only possibility because this is a off trunk)
    const parent = this.getBranchParent(stack.source.branch);
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
