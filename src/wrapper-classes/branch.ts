import { execSync } from "child_process";
import { repoConfig } from "../lib/config";
import { ExitFailedError } from "../lib/errors";
import {
  getBranchChildrenOrParentsFromGit,
  getRef,
  otherBranchesWithSameCommit,
} from "../lib/git-refs";
import { getCommitterDate, getTrunk, gpExecSync, logDebug } from "../lib/utils";
import Commit from "./commit";
import MetadataRef, { TBranchPRInfo, TMeta } from "./metadata_ref";

type TBranchFilters = {
  useMemoizedResults?: boolean;
  maxDaysBehindTrunk?: number;
  maxBranches?: number;
  sort?: "-committerdate";
};

let memoizedMetaChildren: Record<string, Branch[]> | undefined;

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
    const gitParents = curBranch.getParentsFromGit();
    if (gitParents.length === 1) {
      return this.stackByTracingGitParents(gitParents[0]).concat([
        curBranch.name,
      ]);
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

    // Cycle until we find a parent that has a real branch, or just is undefined.
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
    logDebug(`Meta Children (${this.name}): start`);
    if (this.shouldUseMemoizedResults) {
      if (memoizedMetaChildren === undefined) {
        logDebug(
          `Meta Children (${this.name}): initialize memoization | finding all branches...`
        );
        const metaChildren: Record<string, Branch[]> = {};
        const allBranches = Branch.allBranches({
          useMemoizedResults: this.shouldUseMemoizedResults,
        });

        logDebug(
          `Meta Children: intiialize memoization | sifting through branches...`
        );
        allBranches.forEach((branch, i) => {
          logDebug(
            `               Branch ${i}/${allBranches.length} (${branch.name})`
          );
          const parentBranchName = MetadataRef.getMeta(
            branch.name
          )?.parentBranchName;
          if (parentBranchName === undefined) {
            return;
          }
          if (parentBranchName in metaChildren) {
            metaChildren[parentBranchName].push(branch);
          } else {
            metaChildren[parentBranchName] = [branch];
          }
        });
        logDebug(`Meta Children (${this.name}): initialize memoization | done`);

        memoizedMetaChildren = metaChildren;
      }

      logDebug(`Meta Children (${this.name}): end (memoized)`);
      return memoizedMetaChildren[this.name] ?? [];
    }

    const children = Branch.allBranches().filter(
      (b) => MetadataRef.getMeta(b.name)?.parentBranchName === this.name
    );
    logDebug(`Git Children (${this.name}): end`);
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

  public clearMetadata(): this {
    this.writeMeta({});
    return this;
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

  public resetParentBranch(): void {
    const meta: TMeta = this.getMeta() || {};
    meta.parentBranchName = undefined;
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
      .filter(
        (name) =>
          !repoConfig.getIgnoreBranches().includes(name) && name.length > 0
      )
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
        return branch.getParentsFromGit().length === 0;
      },
      opts: opts,
    });
  }

  static async getAllBranchesWithParents(
    opts?: TBranchFilters
  ): Promise<Branch[]> {
    return this.allBranchesWithFilter({
      filter: (branch) => branch.getParentsFromGit().length > 0,
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
    logDebug(`Git Children (${this.name}): start`);
    const kids = getBranchChildrenOrParentsFromGit(this, {
      direction: "children",
      useMemoizedResults: this.shouldUseMemoizedResults,
    });

    // In order to tacitly support those that use merge workflows, our logic
    // marks children it has visited - and short circuits - to avoid
    // duplication. This means that the ordering of children must be consistent
    // between git and meta to ensure that our views of their stacks always
    // align.
    logDebug(`Git Children (${this.name}): end`);
    return kids.sort(this.sortBranchesAlphabetically);
  }

  private sortBranchesAlphabetically(a: Branch, b: Branch) {
    if (a.name === b.name) {
      return 0;
    } else if (a.name < b.name) {
      return -1;
    } else {
      return 1;
    }
  }

  public getParentsFromGit(): Branch[] {
    if (
      // Current branch is trunk
      this.name === getTrunk().name
      // Current branch shares
    ) {
      return [];
    } else if (this.pointsToSameCommitAs(getTrunk())) {
      return [getTrunk()];
    }

    // In order to tacitly support those that use merge workflows, our logic
    // marks children it has visited - and short circuits - to avoid
    // duplication. This means that the ordering of children must be consistent
    // between git and meta to ensure that our views of their stacks always
    // align.
    return getBranchChildrenOrParentsFromGit(this, {
      direction: "parents",
      useMemoizedResults: this.shouldUseMemoizedResults,
    }).sort(this.sortBranchesAlphabetically);
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

  public clearPRInfo(): void {
    const meta: TMeta = this.getMeta() || {};
    meta.prInfo = undefined;
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
    if (parent === undefined) {
      return [];
    }

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
