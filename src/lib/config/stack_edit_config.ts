import { Stack } from '../../wrapper-classes';
import path from 'path';
import { getRepoRootPath } from '../config';
import * as fs from 'fs';
import { logInfo } from './splog';

class StackEditSwp {
  _stack: Stack;
  _file: string;
  // TODO: Should stack be a member of this class
  // TODO: Should file name be a member of this class? Yes, so that path join is not called repeatedly
  constructor(stack: Stack) {
    this._stack = stack;
    this._file = path.join(getRepoRootPath(), this.generateFileName());
  }
  /*
  Functionality we want:
   - Create template file for a given stack
   - Let the user edit the file
   - Read the file contents into an ordered list of stackOrderNode and return
   */
  private generateFileName(): string {
    return 'stub'; //TODO: Use this._stack
  }

  private filePath(): string {
    return this._file;
  }

  private generateTemplateData(): string {
    //TODO: Does this print correctly?
    const branchListString = '';
    for (const branch of this._stack.branches()) {
      branchListString.concat(`pick\t${branch.name}\n`);
    }

    const templateData =
      '# Commands: \n' +
      '# p, pick = use branch and place it in the stack in row order \n' +
      '# m, merge = combine branches \n' +
      '# d, drop = delete branch from stack \n\n';

    return branchListString.concat(templateData);
  }

  public getStackEditSwpFile(): string {
    // Generate file name
    // If it exists, return, if it doesn't create one, add template data and then return
    const file = this.filePath();
    if (!fs.existsSync(file)) {
      const data = this.generateTemplateData();
      fs.writeFileSync(file, data);
    }

    return file;
  }

  //TODO: Change this to return StackOrderNode
  public readFileContents(): void {
    // let stackOrderNode = new StackOrderNode();
    if (fs.existsSync(this.filePath())) {
      const rawContents = fs.readFileSync(this.filePath()).toString().trim();
      for (const row of rawContents) {
        //TODO: Read line by line
        logInfo(row.toString());
        // TODO: Extract operation and branches from string and populate into data structure
      }
      return;
    }
  }
}
