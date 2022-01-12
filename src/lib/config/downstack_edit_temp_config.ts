import { Stack } from '../../wrapper-classes';
import path from 'path';
import { getRepoRootPath } from './index';
import fs from 'fs-extra';
import { getTrunk, logDebug } from '../utils';
import { StackOrderNode } from '../../actions/downstack_edit';
import Branch from '../../wrapper-classes/branch';
import objectHash from 'object-hash';
import { ConfigError } from '../errors';

export class StackEditConfig {
  _stack: Stack;
  _file: string;

  //TODO (Greg): Should this only be limited to meta stacks or git stacks can be included too?
  constructor(stack: Stack) {
    this._stack = stack;
    this._file = path.join(getRepoRootPath(), this.generateFileName());
  }

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

  public getStackEditTempConfig(): string {
    const file = this.filePath();
    if (!fs.existsSync(file)) {
      logDebug(`File ${file} doesn't exist. Generating from template.`);
      const data = this.generateTemplateData();
      fs.writeFileSync(file, data, 'utf-8');
    }
    return file;
  }

  public readFileContents(): StackOrderNode[] {
    if (!fs.existsSync(this.filePath())) {
      throw new ConfigError(
        `Something went wrong. stack-edit-temp file for this stack was not found.`
      );
    }

    const stackOrderNodes: StackOrderNode[] = [
      {
        branch: getTrunk(),
        operation: 'PICK',
      },
    ];
    const oldBranches = this._stack.branches();
    const newBranches: string[] = [];

    const rawContents = fs.readFileSync(this.filePath()).toString().trim();
    const rows = rawContents.trim().split('\n');
    for (const row of rows) {
      if (row.trim().startsWith('#')) {
        continue;
      }
      const details = row.split(/[ ,]+/);
      const branch = new Branch(details[1], { useMemoizedResults: true });
      // TODO (Greg): We should probably validate details[1] is an existing branch
      newBranches.push(branch.name);
      const operation = details[0].toUpperCase() === 'PICK' ? 'PICK' : 'DROP'; // TODO: Become resilient to typos. Perhaps send the user back to edit with error message appended to end?
      stackOrderNodes.push({
        branch: branch,
        operation: operation,
      });
    }

    // Handle deleted lines
    const droppedBranches = oldBranches.filter(
      (b) => !newBranches.includes(b.name) && !b.isTrunk()
    );
    for (const branch of droppedBranches) {
      stackOrderNodes.push({ branch: branch, operation: 'DROP' });
    }
    return stackOrderNodes;
  }
}
