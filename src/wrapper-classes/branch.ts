import { execSync } from "child_process";
import { repoConfig } from "../lib/config";
import {
  ExitFailedError,
  MultiParentError,
  SiblingBranchError,
} from "../lib/errors";
import {
  getBranchChildrenOrParentsFromGit,
  getRef,
  otherBranchesWithSameCommit,
} from "../lib/git-refs";
import { getCommitterDate, getTrunk, gpExecSync } from "../lib/utils";
import Commit from "./commit";
import MetadataRef, { TBranchPRInfo, TMeta } from "./metadata_ref";

type TBranchFilters = {
  useMemoizedResults?: boolean;
  maxDaysBehindTrunk?: number;
  maxBranches?: number;
  sort?: "-committerdate";
};

export default class Branch {
  name: string;
  shouldUseMemoizedResults: boolean;

  constructor(name: string, opts?: { useMemoizedResults: boolean }) {
    this.name = name;
    this.shouldUseMemoizedResults = opts?.useMemoizedResults || false;
  }

  /**
   * Uses memoized results for some of the branch calculations. Only turn this
   * on if the git tree should not change at all during the current invoked
   * command.
   */
  public useMemoizedResults(): Branch {
    this.shouldUseMemoizedResults = true;
    return this;
  }

  public toString(): string {
    return this.name;
  }

  stackByTracingMetaParents(branch?: Branch): string[] {
    const curBranch = branch || this;
    const metaParent = curBranch.getParentFromMeta();
    if (metaParent) {
      return this.stackByTracingMetaParents(metaParent).concat([
        curBranch.name,
      ]);
    } else {
      return [curBranch.name];
    }
  }

  stackByTracingGitParents(branch?: Branch): string[] {
    const curBranch = branch || this;
    const gitParent = curBranch.getParentFromGit();
    if (gitParent) {
      return this.stackByTracingGitParents(gitParent).concat([curBranch.name]);
    } else {
      return [curBranch.name];
    }
  }

  getParentFromMeta(): Branch | undefined {
    if (this.name === getTrunk().name) {
      return undefined;
    }

    let parentName = MetadataRef.getMeta(this.name)?.parentBranchName;

    if (!parentName) {
      return undefined;
    }

    // Cycle untile we find a parent that has a real branch, or just is undefined.
    if (!Branch.exists(parentName)) {
      while (parentName && !Branch.exists(parentName)) {
        parentName = MetadataRef.getMeta(parentName)?.parentBranchName;
      }
      if (parentName) {
        this.setParentBranchName(parentName);
      } else {
        this.clearParentMetadata();
        return undefined;
      }
    }

    if (parentName === this.name) {
      this.clearParentMetadata();
      throw new ExitFailedError(
        `Branch (${this.name}) has itself listed as a parent in the meta. Deleting (${this.name}) parent metadata and exiting.`
      );
    }
    return new Branch(parentName);
  }

  public getChildrenFromMeta(): Branch[] {
    const children = Branch.allBranches().filter(
      (b) => MetadataRef.getMeta(b.name)?.parentBranchName === this.name
    );
    return children;
  }

  public isUpstreamOf(commitRef: string): boolean {
    const downstreamRef = gpExecSync({
      command: `git merge-base ${this.name} ${commitRef}`,
    })
      .toString()
      .trim();

    return downstreamRef !== this.ref();
  }

  public ref(): string {
    return getRef(this);
  }

  public getMetaMergeBase(): string | undefined {
    const parent = this.getParentFromMeta();
    if (!parent) {
      return undefined;
    }
    const curParentRef = parent.getCurrentRef();
    const prevParentRef = parent.getMetaPrevRef();
    const curParentMergeBase = execSync(
      `git merge-base ${curParentRef} ${this.name}`
    )
      .toString()
      .trim();
    if (!prevParentRef) {
      return curParentMergeBase;
    }

    const prevParentMergeBase = execSync(
      `git merge-base ${prevParentRef} ${this.name}`
    )
      .toString()
      .trim();

    // The merge base of the two merge bases = the one closer to the trunk.
    // Therefore, the other must be closer or equal to the head of the branch.
    const closestMergeBase =
      execSync(`git merge-base ${prevParentMergeBase} ${curParentMergeBase}`)
        .toString()
        .trim() === curParentMergeBase
        ? prevParentMergeBase
        : curParentMergeBase;

    return closestMergeBase;
  }

  public static exists(branchName: string): boolean {
    try {
      execSync(`git show-ref --quiet refs/heads/${branchName}`, {
        stdio: "ignore",
      });
    } catch {
      return false;
    }
    return true;
  }

  private getMeta(): TMeta | undefined {
    return MetadataRef.getMeta(this.name);
  }

  private writeMeta(meta: TMeta): void {
    MetadataRef.updateOrCreate(this.name, meta);
  }

  public getMetaPrevRef(): string | undefined {
    return MetadataRef.getMeta(this.name)?.prevRef;
  }

  public getCurrentRef(): string {
    return execSync(`git rev-parse ${this.name}`).toString().trim();
  }

  public clearParentMetadata(): void {
    const meta: TMeta = this.getMeta() || {};
    delete meta.parentBranchName;
    this.writeMeta(meta);
  }

  public setParentBranchName(parentBranchName: string): void {
    const meta: TMeta = this.getMeta() || {};
    meta.parentBranchName = parentBranchName;
    this.writeMeta(meta);
  }

  public setMetaPrevRef(prevRef: string): void {
    const meta: TMeta = this.getMeta() || {};
    meta.prevRef = prevRef;
    this.writeMeta(meta);
  }

  public lastCommitTime(): number {
    return parseInt(
      gpExecSync({ command: `git log ${this.name} -1 --format=%ct` })
        .toString()
        .trim()
    );
  }

  public isTrunk(): boolean {
    return this.name === getTrunk().name;
  }

  static async branchWithName(name: string): Promise<Branch> {
    const branch = Branch.allBranches().find((b) => b.name === name);
    if (!branch) {
      throw new Error(`Failed to find branch named ${name}`);
    }
    return new Branch(name);
  }

  static getCurrentBranch(): Branch | null {
    const name = gpExecSync(
      {
        command: `git rev-parse --abbrev-ref HEAD`,
      },
      (e) => {
        return Buffer.alloc(0);
      }
    )
      .toString()
      .trim();

    // When the object we've checked out is a commit (and not a branch),
    // git rev-parse --abbrev-ref HEAD returns 'HEAD'. This isn't a valid
    // branch.
    return name.length > 0 && name !== "HEAD" ? new Branch(name) : null;
  }

  private static allBranchesImpl(opts?: { sort?: "-committerdate" }): Branch[] {
    const sortString = opts?.sort === undefined ? "" : `--sort='${opts?.sort}'`;
    return execSync(
      `git for-each-ref --format='%(refname:short)' ${sortString} refs/heads/`
    )
      .toString()
      .trim()
      .split("\n")
      .filter((name) => !repoConfig.getIgnoreBranches().includes(name))
      .map((name) => new Branch(name));
  }

  static allBranches(opts?: TBranchFilters): Branch[] {
    return Branch.allBranchesWithFilter({
      filter: () => true,
      opts: opts,
    });
  }

  static allBranchesWithFilter(args: {
    filter: (branch: Branch) => boolean;
    opts?: TBranchFilters;
  }): Branch[] {
    let branches = Branch.allBranchesImpl({
      sort:
        args.opts?.maxDaysBehindTrunk !== undefined
          ? "-committerdate"
          : args.opts?.sort,
    });

    if (args.opts?.useMemoizedResults) {
      branches = branches.map((branch) => branch.useMemoizedResults());
    }

    const maxDaysBehindTrunk = args.opts?.maxDaysBehindTrunk;
    let minUnixTimestamp = undefined;
    if (maxDaysBehindTrunk) {
      const trunkUnixTimestamp = parseInt(
        getCommitterDate({
          revision: getTrunk().name,
          timeFormat: "UNIX_TIMESTAMP",
        })
      );
      const secondsInDay = 24 * 60 * 60;
      minUnixTimestamp = trunkUnixTimestamp - maxDaysBehindTrunk * secondsInDay;
    }
    const maxBranches = args.opts?.maxBranches;

    const filteredBranches = [];
    for (let i = 0; i < branches.length; i++) {
      if (filteredBranches.length === maxBranches) {
        break;
      }

      // If the current branch is older than the minimum time, we can
      // short-circuit the rest of the search as well - we gathered the
      // branches in descending chronological order.
      if (minUnixTimestamp !== undefined) {
        const committed = parseInt(
          getCommitterDate({
            revision: branches[i].name,
            timeFormat: "UNIX_TIMESTAMP",
          })
        );
        if (committed < minUnixTimestamp) {
          break;
        }
      }

      if (args.filter(branches[i])) {
        filteredBranches.push(branches[i]);
      }
    }

    return filteredBranches;
  }

  static async getAllBranchesWithoutParents(
    opts?: TBranchFilters & {
      excludeTrunk?: boolean;
    }
  ): Promise<Branch[]> {
    return this.allBranchesWithFilter({
      filter: (branch) => {
        if (opts?.excludeTrunk && branch.name === getTrunk().name) {
          return false;
        }
        return !!branch.getParentFromGit;
      },
      opts: opts,
    });
  }

  static async getAllBranchesWithParents(
    opts?: TBranchFilters
  ): Promise<Branch[]> {
    return this.allBranchesWithFilter({
      filter: (branch) => !!branch.getParentFromGit(),
      opts: opts,
    });
  }

  public head(): Commit {
    return new Commit(execSync(`git rev-parse ${this.name}`).toString().trim());
  }

  public base(): Commit | undefined {
    const parentBranchName = this.getMeta()?.parentBranchName;
    if (!parentBranchName) {
      return undefined;
    }
    return new Commit(
      execSync(`git merge-base ${parentBranchName} ${this.name}`)
        .toString()
        .trim()
    );
  }

  public getChildrenFromGit(): Branch[] {
    const kids = getBranchChildrenOrParentsFromGit(this, {
      direction: "children",
      useMemoizedResults: this.shouldUseMemoizedResults,
    });
    const siblings = this.branchesWithSameCommit();
    if (siblings.length > 0) {
      // consider if siblings are children.
      siblings.forEach((s) => {
        if (s.getParentFromMeta()?.name === this.name) {
          kids.push(s);
        }
      });
    }
    return kids;
  }

  public getParentFromGit(): Branch | undefined {
    if (this.name === getTrunk().name) {
      return undefined;
    } else if (this.pointsToSameCommitAs(getTrunk())) {
      return getTrunk();
    }

    const siblings = this.branchesWithSameCommit();

    // If the current branch has siblings (pointing to the same commit)
    // consider the chance that one of them is the parent of the current branch.
    // We only consider a sibling a parent if there is metadata pointing to it.
    // This is the one edge case that we use metadata when deriving a parent from git.
    // If metadata can't prove the parent relationship, through a sibling error.
    if (siblings.length > 0) {
      const metaParent = this.getParentFromMeta();
      if (!metaParent) {
        // Without metadata, just throw a sibling error.
        throw new SiblingBranchError(siblings.concat([this]));
      }
      // With meta, attempt to discern between siblings and normal git parents.
      if (siblings.find((s) => s.name === metaParent.name)) {
        return metaParent;
      }
      // At this point, we have meta, and we know the parent isnt a sibling.
      // Proceed to check the git parent(s)
    }

    const parents = getBranchChildrenOrParentsFromGit(this, {
      direction: "parents",
      useMemoizedResults: this.shouldUseMemoizedResults,
    });

    // If there are multiple parents per git, once again use metadata to make a decision.
    // If there is no metadata to help the decision, through a multi-parent error.
    if (parents.length > 1) {
      const metaParent = this.getParentFromMeta();
      if (metaParent && parents.find((p) => p.name === metaParent.name)) {
        return metaParent;
      }
      throw new MultiParentError(this, parents);
    }
    return parents[0];
  }

  private pointsToSameCommitAs(branch: Branch): boolean {
    return !!otherBranchesWithSameCommit(branch).find(
      (b) => b.name === branch.name
    );
  }

  public branchesWithSameCommit(): Branch[] {
    return otherBranchesWithSameCommit(this);
  }

  public setPRInfo(prInfo: TBranchPRInfo): void {
    const meta: TMeta = this.getMeta() || {};
    meta.prInfo = prInfo;
    this.writeMeta(meta);
  }

  public getPRInfo(): TBranchPRInfo | undefined {
    return this.getMeta()?.prInfo;
  }

  // Due to deprecate in favor of other functions.
  public getCommitSHAs(): string[] {
    // We rely on meta here as the source of truth to handle the case where
    // the user has just created a new branch, but hasn't added any commits
    // - so both branch tips point to the same commit. Graphite knows that
    // this is a parent-child relationship, but git does not.
    const parent = this.getParentFromMeta();
    const shas: Set<string> = new Set();

    const commits = gpExecSync(
      {
        command: `git rev-list ${parent}..${this.name}`,
      },
      (_) => {
        // just soft-fail if we can't find the commits
        return Buffer.alloc(0);
      }
    )
      .toString()
      .trim();

    if (commits.length === 0) {
      return [];
    }

    commits.split(/[\r\n]+/).forEach((sha) => {
      shas.add(sha);
    });

    return [...shas];
  }
}
