import { TContext } from '../lib/context';
import { getCurrentBranchName } from '../lib/git/current_branch_name';
import { sortedBranchNames } from '../lib/git/sorted_branch_names';
import { TMeta, writeMetadataRef } from '../lib/state/metadata_ref';

export class Branch {
  name: string;

  static create(
    branchName: string,
    parentBranchName: string,
    parentBranchRevision: string
  ): void {
    const branch = new Branch(branchName);
    branch.writeMeta({ parentBranchName, parentBranchRevision });
  }

  constructor(name: string) {
    this.name = name;
  }

  public toString(): string {
    return this.name;
  }

  private writeMeta(meta: TMeta): void {
    writeMetadataRef(this.name, meta);
  }

  static currentBranch(): Branch | undefined {
    const name = getCurrentBranchName();

    // When the object we've checked out is a commit (and not a branch),
    // git rev-parse --abbrev-ref HEAD returns 'HEAD'. This isn't a valid
    // branch.
    return name ? new Branch(name) : undefined;
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
