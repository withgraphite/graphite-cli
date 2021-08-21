import { execSync } from "child_process";
import { ExitFailedError } from "../lib/errors";
import {
  getBranchChildrenOrParentsFromGit,
  getCommitterDate,
  getTrunk,
  gpExecSync,
} from "../lib/utils";
import Commit from "./commit";

type TMeta = {
  parentBranchName?: string;
  prevRef?: string;
  prInfo?: {
    number: number;
    url: string;
  };
};

type TBranchFilters = {
  useMemoizedResults?: boolean;
  maxDaysBehindTrunk?: number;
  maxBranches?: number;
  sort?: "-committerdate";
};

export default class Branch {
  name: string;
  shouldUseMemoizedResults: boolean;

  constructor(name: string) {
    this.name = name;
    this.shouldUseMemoizedResults = false;
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

  private getMeta(): TMeta | undefined {
    try {
      const metaString = execSync(
        `git cat-file -p refs/branch-metadata/${this.name} 2> /dev/null`
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

  private writeMeta(desc: TMeta) {
    const metaSha = execSync(`git hash-object -w --stdin`, {
      input: JSON.stringify(desc),
    }).toString();
    execSync(`git update-ref refs/branch-metadata/${this.name} ${metaSha}`, {
      stdio: "ignore",
    });
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
    console.log(`getting meta parent ${this.name}`);
    if (this.name === getTrunk().name) {
      return undefined;
    }

    let parentName = this.getMeta()?.parentBranchName;

    if (!parentName) {
      return undefined;
    }

    // Cycle untile we find a parent that has a real branch, or just is undefined.
    if (!Branch.exists(parentName)) {
      while (parentName && !Branch.exists(parentName)) {
        parentName = new Branch(parentName).getMeta()?.parentBranchName;
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
    console.log(`getting meta children ${this.name}`);
    const children = Branch.allBranches().filter(
      (b) => b.getMeta()?.parentBranchName === this.name
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
    return gpExecSync(
      {
        command: `git show-ref refs/heads/${this.name} -s`,
      },
      (_) => {
        throw new ExitFailedError(
          `Could not find ref refs/heads/${this.name}.`
        );
      }
    )
      .toString()
      .trim();
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

  public getMetaPrevRef(): string | undefined {
    return this.getMeta()?.prevRef;
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
    console.log(`get children from git ${this.name}`);
    return getBranchChildrenOrParentsFromGit(this, {
      direction: "CHILDREN",
      useMemoizedResults: this.shouldUseMemoizedResults,
    });
  }

  public getParentsFromGit(): Branch[] {
    console.log(`get parents from git ${this.name}`);
    if (
      // Current branch is trunk
      this.name === getTrunk().name
      // Current branch shares
    ) {
      return [];
    } else if (this.pointsToSameCommitAs(getTrunk())) {
      return [getTrunk()];
    }
    return getBranchChildrenOrParentsFromGit(this, {
      direction: "PARENTS",
      useMemoizedResults: this.shouldUseMemoizedResults,
    });
  }

  private pointsToSameCommitAs(branch: Branch): boolean {
    return !!this.branchesWithSameCommit().find((b) => b.name === branch.name);
  }

  public setPRInfo(prInfo: { number: number; url: string }): void {
    const meta: TMeta = this.getMeta() || {};
    meta.prInfo = prInfo;
    this.writeMeta(meta);
  }

  public getPRInfo(): { number: number; url: string } | undefined {
    return this.getMeta()?.prInfo;
  }

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

  public branchesWithSameCommit(): Branch[] {
    const matchingBranchesRaw = execSync(
      `git show-ref --heads | grep ${this.ref()} | grep -v "refs/heads/${
        this.name
      }" | awk '{print $2}'`
    )
      .toString()
      .trim();

    // We want to check the length before we split because ''.split("\n")
    // counterintuitively returns [ '' ] (an array with 1 entry as the empty
    // string).
    if (matchingBranchesRaw.length === 0) {
      return [];
    }

    const matchingBranches = matchingBranchesRaw
      .split("\n")
      .filter((line) => line.length > 0)
      .map((refName) => refName.replace("refs/heads/", ""))
      .map((name) => new Branch(name));
    return matchingBranches;
  }
}
