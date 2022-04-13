import { Branch } from './branch';
import { StackNode } from './stack_node';

export class Stack {
  source: StackNode;

  constructor(source: StackNode) {
    this.source = source;
  }

  public branches(): Branch[] {
    let branches = [this.source.branch];
    this.source.children.forEach((c) => {
      branches = branches.concat(new Stack(c).branches());
    });
    return branches;
  }

  public toPromptChoices(indent = 0): { title: string; value: string }[] {
    let choices = [
      {
        title: `${'  '.repeat(indent)}↳ (${this.source.branch.name})`,
        value: this.source.branch.name,
      },
    ];
    this.source.children.forEach((c) => {
      choices = choices.concat(new Stack(c).toPromptChoices(indent + 1));
    });
    return choices;
  }

  public toString(): string {
    const indentMultilineString = (lines: string) =>
      lines
        .split('\n')
        .map((l) => '  ' + l)
        .join('\n');

    return this.source.children
      .map((c) => new Stack(c).toString())
      .map(indentMultilineString)
      .concat([`↱ (${this.source.branch.name})`])
      .join('\n');
  }

  public toDictionary(): Record<string, any> {
    return this.source.toDictionary();
  }

  public equals(other: Stack): boolean {
    return this.base().equals(other.base());
  }

  private base(): StackNode {
    let base = this.source;
    while (base.parent) {
      base = base.parent;
    }
    return base;
  }

  static fromMap(map: Record<string, any>): Stack {
    if (Object.keys(map).length != 1) {
      throw Error(`Map must have only only top level branch name`);
    }
    const sourceBranchName = Object.keys(map)[0] as string;
    const sourceNode: StackNode = new StackNode({
      branch: new Branch(sourceBranchName),
      parent: undefined,
      children: [],
    });
    sourceNode.children = StackNode.childrenNodesFromMap(
      sourceNode,
      map[sourceBranchName]
    );

    return new Stack(sourceNode);
  }
}
