import { Branch } from './branch';

export type StackMap = { [key: string]: StackMap | undefined };
export class StackNode {
  branch: Branch;
  parent?: StackNode;
  children: StackNode[];

  constructor(opts: {
    branch: Branch;
    parent?: StackNode;
    children?: StackNode[];
  }) {
    this.branch = opts.branch;
    this.parent = opts.parent || undefined;
    this.children = opts.children || [];
  }

  public equals(other: StackNode): boolean {
    if (this.branch.name !== other.branch.name) {
      return false;
    }
    if (this.children.length === 0 && other.children.length === 0) {
      return true;
    }
    if (
      this.children
        .map((c) => c.branch.name)
        .sort()
        .join(' ') !==
      other.children
        .map((c) => c.branch.name)
        .sort()
        .join(' ')
    ) {
      return false;
    }
    if (this.parent?.branch.name !== other.parent?.branch.name) {
      return false;
    }
    return this.children.every((c) => {
      return c.equals(
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        other.children.find((bc) => bc.branch.name == c.branch.name)!
      );
    });
  }

  public static childrenNodesFromMap(
    parent: StackNode,
    map?: StackMap
  ): StackNode[] {
    if (!map) {
      return [];
    }
    return Object.keys(map).map((branchName) => {
      const node: StackNode = new StackNode({
        branch: new Branch(branchName),
        parent: parent,
        children: [],
      });
      node.children = StackNode.childrenNodesFromMap(node, map[branchName]);
      return node;
    });
  }
}
