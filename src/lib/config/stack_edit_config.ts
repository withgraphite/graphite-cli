import { Stack } from '../../wrapper-classes';
import path from 'path';
import { getRepoRootPath } from './index';
import fs from 'fs-extra';
import { getTrunk } from '../utils';
import StackOrderNode from '../../actions/stack_edit';
import Branch from '../../wrapper-classes/branch';
import objectHash from 'object-hash';

export class StackEditConfig {
  _stack: Stack;
  _file: string;
  constructor(stack: Stack) {
    this._stack = stack;
    this._file = path.join(getRepoRootPath(), this.generateFileName());
  }
  /*
  Functionality we want:
   - Create template file for a given stack
   - Let the user edit the file
   - Read the file contents into an ordered list of stackOrderNode and return

   From the perspective of the caller, all this should be one function. Get file for editing and return contents in a structure
   */
  private generateFileName(): string {
    return `gt_se_${objectHash(this._stack)}`;
  }

  private filePath(): string {
    return this._file;
  }

  private generateTemplateData(): string {
    let branchListString = '';
    for (const branch of this._stack.branches()) {
      if (!branch.isTrunk()) {
        branchListString = branchListString.concat(`pick\t${branch.name}\n`);
      }
    }

    // TODO: Add more instructions on how things are interpreted here
    const templateData =
      '\n\n' +
      '# Commands: \n' +
      '# p, pick = use branch and place it in the stack in row order \n' +
      '# d, drop = delete branch from stack \n\n';

    return branchListString.concat(templateData);
  }

  public cleanUp(): void {
    if (fs.existsSync(this._file)) {
      fs.removeSync(this._file);
    }
  }

  public getStackEditSwpFile(): string {
    const file = this.filePath();
    if (!fs.existsSync(file)) {
      const data = this.generateTemplateData();
      fs.writeFileSync(file, data, 'utf-8');
    }
    return file;
  }

  public readFileContents(): StackOrderNode[] {
    const stackOrderNodes = [
      new StackOrderNode({
        branch: getTrunk(),
        operation: 'PICK',
      }),
    ];
    const oldBranches = this._stack.branches();
    const newBranches: string[] = [];
    if (fs.existsSync(this.filePath())) {
      const rawContents = fs.readFileSync(this.filePath()).toString().trim();
      const rows = rawContents.split('#')[0].trim().split('\n');
      for (const row of rows) {
        const details = row.split('\t');
        const branch = new Branch(details[1], { useMemoizedResults: true });
        newBranches.push(branch.name);
        const operation = details[0].toUpperCase() === 'PICK' ? 'PICK' : 'DROP';
        stackOrderNodes.push(
          new StackOrderNode({
            branch: branch,
            operation: operation,
          })
        );
      }
    }
    // Handle deleted lines
    const droppedBranches = oldBranches.filter(
      (b) => !newBranches.includes(b.name) && !b.isTrunk()
    );
    for (const branch of droppedBranches) {
      stackOrderNodes.push(
        new StackOrderNode({ branch: branch, operation: 'DROP' })
      );
    }
    return stackOrderNodes;
  }
}
