import { execSync } from 'child_process';
import fs from 'fs-extra';
import path from 'path';
import { getRepoRootPath } from '../lib/config/repo_root_path';
import { ExitFailedError } from '../lib/errors';

export type TBranchPRState = 'OPEN' | 'CLOSED' | 'MERGED';
export type TBranchPRReviewDecision =
  | 'APPROVED'
  | 'REVIEW_REQUIRED'
  | 'CHANGES_REQUESTED';
export type TBranchPRInfo = {
  number?: number;
  base?: string;
  url?: string;
  title?: string;
  body?: string;
  state?: TBranchPRState;
  reviewDecision?: TBranchPRReviewDecision;
  isDraft?: boolean;
};

export type TMeta = {
  parentBranchName?: string;
  parentBranchRevision?: string;
  prevRef?: string;
  prInfo?: TBranchPRInfo;
};

export class MetadataRef {
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

  static getMeta(
    branchName: string,
    opts?: { dir: string }
  ): TMeta | undefined {
    return new MetadataRef(branchName).read(opts);
  }

  static updateOrCreate(
    branchName: string,
    meta: TMeta,
    opts?: { dir: string }
  ): void {
    const metaSha = execSync(
      `git ${opts ? `-C "${opts.dir}"` : ''} hash-object -w --stdin`,
      {
        input: JSON.stringify(meta),
      }
    ).toString();
    execSync(`git update-ref refs/branch-metadata/${branchName} ${metaSha}`, {
      stdio: 'ignore',
    });
  }

  static copyMetadataRefFromRemoteTracking(
    remote: string,
    branchName: string
  ): void {
    execSync(
      `git update-ref refs/branch-metadata/${branchName} $(git show-ref refs/${remote}-branch-metadata/${branchName} -s)`,
      {
        stdio: 'ignore',
      }
    );
  }

  static readRemote(remote: string, branchName: string): TMeta | undefined {
    return MetadataRef.readImpl(`refs/${remote}-branch-metadata/${branchName}`);
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

  public read(opts?: { dir: string }): TMeta | undefined {
    return MetadataRef.readImpl(
      `refs/branch-metadata/${this._branchName}`,
      opts
    );
  }

  private static readImpl(
    ref: string,
    opts?: { dir: string }
  ): TMeta | undefined {
    try {
      const metaString = execSync(
        `git ${opts ? `-C "${opts.dir}"` : ''}cat-file -p ${ref} 2> /dev/null`
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
