import { TContext } from '../lib/context';
import { sortedBranchNames } from '../lib/git/sorted_branch_names';

export class Branch {
  name: string;

  constructor(name: string) {
    this.name = name;
  }

  public toString(): string {
    return this.name;
  }

  static allBranches(
    context: TContext,
    opts?: {
      filter?: (branch: Branch) => boolean;
    }
  ): Branch[] {
    const branchNames = sortedBranchNames();

    const filteredBranches = [];
    for (const branchName of branchNames) {
      const branch = new Branch(branchName);

      if (!opts?.filter || opts.filter(branch)) {
        filteredBranches.push(branch);
      }
    }

    return filteredBranches;
  }
}
