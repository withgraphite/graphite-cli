import Branch from "./branch";

export type stackNodeT = {
  branch: Branch;
  parents: stackNodeT[];
  children: stackNodeT[];
};

export class Stack {
  source: stackNodeT;

  constructor(source: stackNodeT) {
    this.source = source;
  }

  public toString(): string {
    return JSON.stringify(nodeToDictionary(this.source), null, 2);
  }

  public toDictionary(): Record<string, any> {
    return nodeToDictionary(this.source);
  }

  public equals(other: Stack): boolean {
    return nodesAreEqual(this.source, other.source);
  }

  static fromMap(map: Record<string, any>): Stack {
    if (Object.keys(map).length != 1) {
      throw Error(`Map must have only only top level branch name`);
    }
    const sourceBranchName = Object.keys(map)[0] as string;
    const sourceNode: stackNodeT = {
      branch: new Branch(sourceBranchName),
      parents: [],
      children: [],
    };
    sourceNode.children = childrenNodesFromMap(
      sourceNode,
      map[sourceBranchName]
    );

    return new Stack(sourceNode);
  }
}

function childrenNodesFromMap(
  parent: stackNodeT,
  map?: Record<string, any>
): stackNodeT[] {
  if (!map) {
    return [];
  }
  return Object.keys(map).map((branchName) => {
    const node: stackNodeT = {
      branch: new Branch(branchName),
      parents: [parent],
      children: [],
    };
    node.children = childrenNodesFromMap(node, map[branchName]);
    return node;
  });
}

function nodeToDictionary(node: stackNodeT): Record<string, any> {
  const data: Record<string, any> = {};
  data[node.branch.name] = {};
  node.children.forEach(
    (child) =>
      (data[node.branch.name][child.branch.name] =
        nodeToDictionary(child)[child.branch.name])
  );
  return data;
}

function nodesAreEqual(a: stackNodeT, b: stackNodeT): boolean {
  if (a.branch.name !== b.branch.name) {
    return false;
  }
  if (a.children.length === 0 && b.children.length === 0) {
    return true;
  }
  if (
    a.children
      .map((c) => c.branch.name)
      .sort()
      .join(" ") !==
    b.children
      .map((c) => c.branch.name)
      .sort()
      .join(" ")
  ) {
    return false;
  }
  if (
    a.parents
      .map((c) => c.branch.name)
      .sort()
      .join(" ") !==
    b.parents
      .map((c) => c.branch.name)
      .sort()
      .join(" ")
  ) {
    return false;
  }
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return a.children.every((c) => {
    return nodesAreEqual(
      c,
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      b.children.find((bc) => bc.branch.name == c.branch.name)!
    );
  });
}
