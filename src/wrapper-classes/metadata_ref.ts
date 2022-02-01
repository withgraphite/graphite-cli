import { execSync } from 'child_process';
import fs from 'fs-extra';
import path from 'path';
import { getRepoRootPath } from '../lib/config';
import { ExitFailedError } from '../lib/errors';

export type TBranchPRState = 'OPEN' | 'CLOSED' | 'MERGED';
export type TBranchPRReviewDecision =
  | 'APPROVED'
  | 'REVIEW_REQUIRED'
  | 'CHANGES_REQUESTED';
export type TBranchPRInfo = {
  number: number;
  base: string;
  url?: string;
  title?: string;
  state?: TBranchPRState;
  reviewDecision?: TBranchPRReviewDecision;
  isDraft?: boolean;
};

export type TBranchPriorSubmitInfo = {
  title?: string;
  body?: string;
  reviewers?: string[];
};

export type TMeta = {
  parentBranchName?: string;
  prevRef?: string;
  prInfo?: TBranchPRInfo;
  priorSubmitInfo?: TBranchPriorSubmitInfo;
};

export default class MetadataRef {
  _branchName: string;

  constructor(branchName: string) {
    this._branchName = branchName;
  }

  private static branchMetadataDirPath(): string {
    return path.join(getRepoRootPath(), `refs/branch-metadata/`);
  }

  private static pathForBranchName(branchName: string): string {
    return path.join(MetadataRef.branchMetadataDirPath(), branchName);
  }

  static getMeta(branchName: string): TMeta | undefined {
    return new MetadataRef(branchName).read();
  }

  static updateOrCreate(branchName: string, meta: TMeta): void {
    const metaSha = execSync(`git hash-object -w --stdin`, {
      input: JSON.stringify(meta),
    }).toString();
    execSync(`git update-ref refs/branch-metadata/${branchName} ${metaSha}`, {
      stdio: 'ignore',
    });
  }

  public getPath(): string {
    return MetadataRef.pathForBranchName(this._branchName);
  }

  public rename(newBranchName: string): void {
    if (!fs.existsSync(this.getPath())) {
      throw new ExitFailedError(
        `No Graphite metadata ref found at ${this.getPath()}`
      );
    }
    fs.moveSync(
      path.join(this.getPath()),
      path.join(path.dirname(this.getPath()), newBranchName)
    );
    this._branchName = newBranchName;
  }

  public read(): TMeta | undefined {
    try {
      const metaString = execSync(
        `git cat-file -p refs/branch-metadata/${this._branchName} 2> /dev/null`
      )
        .toString()
        .trim();
      if (metaString.length == 0) {
        return undefined;
      }
      // TODO: Better account for malformed desc; possibly validate with retype
      const meta = JSON.parse(metaString);
      return meta;
    } catch {
      return undefined;
    }
  }

  public delete(): void {
    fs.removeSync(this.getPath());
  }

  public static allMetadataRefs(): MetadataRef[] {
    if (!fs.existsSync(MetadataRef.branchMetadataDirPath())) {
      return [];
    }
    return fs
      .readdirSync(MetadataRef.branchMetadataDirPath())
      .map((dirent) => new MetadataRef(dirent));
  }
}
