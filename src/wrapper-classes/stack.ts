import { indentMultilineString } from '../lib/utils/indent_multiline_string';
import { Branch } from './branch';
import { StackMap, StackNode } from './stack_node';

export class Stack {
  source: StackNode;

  constructor(source: StackNode) {
    this.source = source;
  }

  public branches(): Branch[] {
    return this.source.children
      .map((c) => new Stack(c).branches())
      .reduce((acc, arr) => acc.concat(arr), [this.source.branch]);
  }

  public toPromptChoices(indent = 0): { title: string; value: string }[] {
    const currentChoice = {
      title: `${'  '.repeat(indent)}↱ (${this.source.branch.name})`,
      value: this.source.branch.name,
    };
    return this.source.children
      .map((c) => new Stack(c).toPromptChoices(indent + 1))
      .reduceRight((acc, arr) => arr.concat(acc), [currentChoice]);
  }

  public toString(): string {
    return this.source.children
      .map((c) => new Stack(c).toString())
      .map((lines) => indentMultilineString(lines, 2))
      .concat([`↱ (${this.source.branch.name})`])
      .join('\n');
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

  static fromMap(map: StackMap): Stack {
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
