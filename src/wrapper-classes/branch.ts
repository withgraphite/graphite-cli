import { execSync } from 'child_process';
import { cache } from '../lib/config/cache';
import { TContext } from '../lib/context';
import { ExitFailedError, PreconditionsFailedError } from '../lib/errors';
import {
  getRef,
  otherBranchesWithSameCommit,
} from '../lib/git-refs/branch_ref';
import { getBranchChildrenOrParentsFromGit } from '../lib/git-refs/branch_relations';
import { branchExists } from '../lib/utils/branch_exists';
import { getCommitterDate } from '../lib/utils/committer_date';
import { gpExecSync } from '../lib/utils/exec_sync';
import { getMergeBase } from '../lib/utils/merge_base';
import { logDebug } from '../lib/utils/splog';
import { getTrunk } from '../lib/utils/trunk';
import { MetadataRef, TBranchPRInfo, TMeta } from './metadata_ref';

type TBranchFilters = {
  useMemoizedResults?: boolean;
  maxDaysBehindTrunk?: number;
  maxBranches?: number;
  sort?: '-committerdate';
};

export class Branch {
  name: string;
  shouldUseMemoizedResults: boolean;

  static create(
    branchName: string,
    parentBranchName: string,
    parentBranchRevision: string
  ): void {
    const branch = new Branch(branchName);
    branch.writeMeta({ parentBranchName, parentBranchRevision });
  }

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

  stackByTracingMetaParents(context: TContext, branch?: Branch): string[] {
    const curBranch = branch || this;
    const metaParent = curBranch.getParentFromMeta(context);
    if (metaParent) {
      return this.stackByTracingMetaParents(context, metaParent).concat([
        curBranch.name,
      ]);
    } else {
      return [curBranch.name];
    }
  }

  stackByTracingGitParents(context: TContext, branch?: Branch): string[] {
    const curBranch = branch || this;
    const gitParents = curBranch.getParentsFromGit(context);
    if (gitParents.length === 1) {
      return this.stackByTracingGitParents(context, gitParents[0]).concat([
        curBranch.name,
      ]);
    } else {
      return [curBranch.name];
    }
  }

  getParentFromMeta(context: TContext): Branch | undefined {
    if (this.name === getTrunk(context).name) {
      return undefined;
    }

    let parentName = MetadataRef.getMeta(this.name)?.parentBranchName;

    if (!parentName) {
      return undefined;
    }

    // Cycle until we find a parent that has a real branch, or just is undefined.
    while (parentName && !branchExists(parentName)) {
      parentName = MetadataRef.getMeta(parentName)?.parentBranchName;
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

  private static calculateMemoizedMetaChildren(
    context: TContext
  ): Record<string, Branch[]> {
    logDebug(`Meta Children: initialize memoization | finding all branches...`);
    const metaChildren: Record<string, Branch[]> = {};
    const allBranches = Branch.allBranches(context, {
      useMemoizedResults: true,
    });

    logDebug(
      `Meta Children: intiialize memoization | sifting through branches...`
    );
    allBranches.forEach((branch, i) => {
      logDebug(
        `               Branch ${i}/${allBranches.length} (${branch.name})`
      );
      const parentBranchName = branch.getParentBranchName();
      if (parentBranchName === undefined) {
        return;
      }
      if (parentBranchName in metaChildren) {
        metaChildren[parentBranchName].push(branch);
      } else {
        metaChildren[parentBranchName] = [branch];
      }
    });
    logDebug(`Meta Children: initialize memoization | done`);

    cache.setMetaChildren(metaChildren);
    return metaChildren;
  }

  public getChildrenFromMeta(context: TContext): Branch[] {
    logDebug(`Meta Children (${this.name}): start`);

    if (!this.shouldUseMemoizedResults) {
      const children = Branch.allBranches(context).filter(
        (b) => MetadataRef.getMeta(b.name)?.parentBranchName === this.name
      );
      logDebug(`Meta Children (${this.name}): end`);
      return children;
    }

    const memoizedMetaChildren = cache.getMetaChildren();
    if (memoizedMetaChildren) {
      logDebug(`Meta Children (${this.name}): end (memoized)`);
      return memoizedMetaChildren[this.name] ?? [];
    }

    logDebug(`Meta Children (${this.name}): end (recalculated)`);
    return Branch.calculateMemoizedMetaChildren(context)[this.name] ?? [];
  }

  public ref(context: TContext): string {
    return getRef(this, context);
  }

  // TODO: Migrate to parentRevision with validation
  public getMetaMergeBase(context: TContext): string | undefined {
    const parent = this.getParentFromMeta(context);
    if (!parent) {
      return undefined;
    }

    const curParentMergeBase = getMergeBase(parent.getCurrentRef(), this.name);

    const prevParentRef = parent.getMetaPrevRef();
    if (!prevParentRef) {
      return curParentMergeBase;
    }

    const prevParentMergeBase = getMergeBase(prevParentRef, this.name);

    // The merge base of the two merge bases = the one closer to the trunk.
    // Therefore, the other must be closer or equal to the head of the branch.
    return getMergeBase(prevParentMergeBase, curParentMergeBase) ===
      curParentMergeBase
      ? prevParentMergeBase
      : curParentMergeBase;
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
    delete meta.parentBranchRevision;
    this.writeMeta(meta);
  }

  public getParentBranchSha(): string | undefined {
    const meta: TMeta = this.getMeta() || {};
    return meta.parentBranchRevision;
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

  public setParentBranch(parent: Branch): void {
    const meta: TMeta = this.getMeta() || {};
    meta.parentBranchName = parent.name;
    meta.parentBranchRevision = parent.getCurrentRef();
    this.writeMeta(meta);
  }

  public savePrevRef(): void {
    const meta: TMeta = this.getMeta() || {};
    meta.prevRef = this.getCurrentRef();
    this.writeMeta(meta);
  }

  public lastCommitTime(): number {
    return parseInt(
      gpExecSync({ command: `git log -1 --format=%ct ${this.name} --` })
        .toString()
        .trim()
    );
  }

  public isTrunk(context: TContext): boolean {
    return this.name === getTrunk(context).name;
  }

  static branchWithName(name: string, context: TContext): Branch {
    const branch = Branch.allBranches(context).find((b) => b.name === name);
    if (!branch) {
      throw new Error(`Failed to find branch named ${name}`);
    }
    return new Branch(name);
  }

  static getCurrentBranch(): Branch | null {
    const name = gpExecSync({
      command: `git rev-parse --abbrev-ref HEAD`,
    })
      .toString()
      .trim();

    // When the object we've checked out is a commit (and not a branch),
    // git rev-parse --abbrev-ref HEAD returns 'HEAD'. This isn't a valid
    // branch.
    return name.length > 0 && name !== 'HEAD' ? new Branch(name) : null;
  }

  private static allBranchesImpl(
    context: TContext,
    opts: { useMemoizedResults: boolean; sort?: '-committerdate' }
  ): Branch[] {
    const sortString = opts?.sort === undefined ? '' : `--sort='${opts?.sort}'`;
    return execSync(
      `git for-each-ref --format='%(refname:short)' ${sortString} refs/heads/`
    )
      .toString()
      .trim()
      .split('\n')
      .filter(
        (name) => name.length > 0 && !context.repoConfig.branchIsIgnored(name)
      )
      .map(
        (name) =>
          new Branch(name, { useMemoizedResults: opts?.useMemoizedResults })
      );
  }

  static allBranches(context: TContext, opts?: TBranchFilters): Branch[] {
    return Branch.allBranchesWithFilter(
      {
        filter: () => true,
        opts: opts,
      },
      context
    );
  }

  static allBranchesWithFilter(
    args: {
      filter: (branch: Branch) => boolean;
      opts?: TBranchFilters;
    },
    context: TContext
  ): Branch[] {
    const branches = Branch.allBranchesImpl(context, {
      useMemoizedResults: args.opts?.useMemoizedResults ?? false,
      sort:
        args.opts?.maxDaysBehindTrunk !== undefined
          ? '-committerdate'
          : args.opts?.sort,
    });

    const maxDaysBehindTrunk = args.opts?.maxDaysBehindTrunk;
    let minUnixTimestamp = undefined;
    if (maxDaysBehindTrunk) {
      const trunkUnixTimestamp = parseInt(
        getCommitterDate({
          revision: getTrunk(context).name,
          timeFormat: 'UNIX_TIMESTAMP',
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
            timeFormat: 'UNIX_TIMESTAMP',
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
    context: TContext,
    opts?: TBranchFilters & {
      excludeTrunk?: boolean;
    }
  ): Promise<Branch[]> {
    return this.allBranchesWithFilter(
      {
        filter: (branch) => {
          if (opts?.excludeTrunk && branch.name === getTrunk(context).name) {
            return false;
          }
          return branch.getParentsFromGit(context).length === 0;
        },
        opts: opts,
      },
      context
    );
  }

  static async getAllBranchesWithParents(
    context: TContext,
    opts?: TBranchFilters
  ): Promise<Branch[]> {
    return this.allBranchesWithFilter(
      {
        filter: (branch) => branch.getParentsFromGit(context).length > 0,
        opts: opts,
      },
      context
    );
  }

  public getChildrenFromGit(context: TContext): Branch[] {
    logDebug(`Git Children (${this.name}): start`);
    const kids = getBranchChildrenOrParentsFromGit(
      this,
      {
        direction: 'children',
        useMemoizedResults: this.shouldUseMemoizedResults,
      },
      context
    );

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

  public getParentsFromGit(context: TContext): Branch[] {
    if (
      // Current branch is trunk
      this.name === getTrunk(context).name
      // Current branch shares
    ) {
      return [];
    } else if (this.pointsToSameCommitAs(getTrunk(context), context)) {
      return [getTrunk(context)];
    }

    // In order to tacitly support those that use merge workflows, our logic
    // marks children it has visited - and short circuits - to avoid
    // duplication. This means that the ordering of children must be consistent
    // between git and meta to ensure that our views of their stacks always
    // align.
    return getBranchChildrenOrParentsFromGit(
      this,
      {
        direction: 'parents',
        useMemoizedResults: this.shouldUseMemoizedResults,
      },
      context
    ).sort(this.sortBranchesAlphabetically);
  }

  private pointsToSameCommitAs(branch: Branch, context: TContext): boolean {
    return !!otherBranchesWithSameCommit(branch, context).find(
      (b) => b.name === branch.name
    );
  }

  public branchesWithSameCommit(context: TContext): Branch[] {
    return otherBranchesWithSameCommit(this, context);
  }

  public upsertPRInfo(prInfo: TBranchPRInfo): void {
    const meta: TMeta = this.getMeta() || {};
    meta.prInfo = { ...meta.prInfo, ...prInfo };
    this.writeMeta(meta);
  }

  public clearPRInfo(): void {
    const meta: TMeta = this.getMeta() || {};
    delete meta.prInfo;
    this.writeMeta(meta);
  }

  public getPRInfo(): TBranchPRInfo | undefined {
    return this.getMeta()?.prInfo;
  }

  public isBaseSameAsRemotePr(context: TContext): boolean {
    const parent = this.getParentFromMeta(context);
    if (parent === undefined) {
      throw new PreconditionsFailedError(
        `Could not find parent for branch ${this.name} to submit PR against. Please checkout ${this.name} and run \`gt upstack onto <parent_branch>\` to set its parent.`
      );
    }
    return parent.name !== this.getPRInfo()?.base;
  }

  // Due to deprecate in favor of other functions.
  public getCommitSHAs(context: TContext): string[] {
    // We rely on meta here as the source of truth to handle the case where
    // the user has just created a new branch, but hasn't added any commits
    // - so both branch tips point to the same commit. Graphite knows that
    // this is a parent-child relationship, but git does not.
    const parent = this.getParentFromMeta(context);
    if (parent === undefined) {
      return [];
    }

    const shas: Set<string> = new Set();

    const commits = gpExecSync(
      {
        command: `git rev-list ${parent}..${this.name} --`,
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
