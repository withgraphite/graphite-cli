import { TContext } from '../lib/context';
import { ExitFailedError } from '../lib/errors';
import { branchExists } from '../lib/git/branch_exists';
import { getCurrentBranchName } from '../lib/git/current_branch_name';
import { getBranchRevision } from '../lib/git/get_branch_revision';
import { sortedBranchNames } from '../lib/git/sorted_branch_names';
import {
  readMetadataRef,
  TMeta,
  writeMetadataRef,
} from '../lib/state/metadata_ref';
import { getTrunk } from '../lib/utils/trunk';

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

  getParentFromMeta(context: TContext): Branch | undefined {
    if (this.name === getTrunk(context).name) {
      return undefined;
    }

    let parentName = readMetadataRef(this.name).parentBranchName;

    if (!parentName) {
      return undefined;
    }

    // Cycle until we find a parent that has a real branch, or just is undefined.
    while (parentName && !branchExists(parentName)) {
      parentName = readMetadataRef(parentName).parentBranchName;
    }
    if (parentName) {
      this.setParentBranchName(parentName);
    } else {
      this.clearParentMetadata();
      return undefined;
    }

    if (parentName === this.name) {
      this.clearParentMetadata();
      throw new ExitFailedError(
        `Branch (${this.name}) has itself listed as a parent in the meta. Deleting (${this.name}) parent metadata and exiting.`
      );
    }
    return new Branch(parentName);
  }

  public getChildrenFromMeta(context: TContext): Branch[] {
    context.splog.logDebug(`Meta Children (${this.name}): start`);

    const children = Branch.allBranches(context).filter(
      (b) => readMetadataRef(b.name).parentBranchName === this.name
    );
    context.splog.logDebug(`Meta Children (${this.name}): end`);
    return children;
  }

  private getMeta(): TMeta | undefined {
    return readMetadataRef(this.name);
  }

  private writeMeta(meta: TMeta): void {
    writeMetadataRef(this.name, meta);
  }

  public clearMetadata(): this {
    this.writeMeta({});
    return this;
  }

  public clearParentMetadata(): void {
    const meta: TMeta = this.getMeta() || {};
    delete meta.parentBranchName;
    delete meta.parentBranchRevision;
    this.writeMeta(meta);
  }

  public getParentBranchName(): string | undefined {
    const meta: TMeta = this.getMeta() || {};
    return meta.parentBranchName;
  }

  public setParentBranchName(parentBranchName: string): void {
    const meta: TMeta = this.getMeta() || {};
    meta.parentBranchName = parentBranchName;
    this.writeMeta(meta);
  }

  public setParentBranch(parentBranchName: string): void {
    const meta: TMeta = this.getMeta() || {};
    meta.parentBranchName = parentBranchName;
    meta.parentBranchRevision = getBranchRevision(parentBranchName);
    this.writeMeta(meta);
  }

  public isTrunk(context: TContext): boolean {
    return this.name === getTrunk(context).name;
  }

  static branchWithName(name: string): Branch {
    if (!branchExists(name)) {
      throw new Error(`Failed to find branch named ${name}`);
    }
    return new Branch(name);
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
