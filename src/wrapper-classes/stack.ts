import { Branch, StackNode } from ".";

export class Stack {
  source: StackNode;

  constructor(source: StackNode) {
    this.source = source;
  }

  public toString(): string {
    const indentMultilineString = (lines: string) =>
      lines
        .split("\n")
        .map((l) => "  " + l)
        .join("\n");

    return [`↳ (${this.source.branch.name})`]
      .concat(
        this.source.children
          .map((c) => new Stack(c).toString())
          .map(indentMultilineString)
      )
      .join("\n");
  }

  public toDictionary(): Record<string, any> {
    return this.source.toDictionary();
  }

  public equals(other: Stack): boolean {
    return this.source.equals(other.source);
  }

  static fromMap(map: Record<string, any>): Stack {
    if (Object.keys(map).length != 1) {
      throw Error(`Map must have only only top level branch name`);
    }
    const sourceBranchName = Object.keys(map)[0] as string;
    const sourceNode: StackNode = new StackNode({
      branch: new Branch(sourceBranchName),
      parents: [],
      children: [],
    });
    sourceNode.children = StackNode.childrenNodesFromMap(
      sourceNode,
      map[sourceBranchName]
    );

    return new Stack(sourceNode);
  }
}
