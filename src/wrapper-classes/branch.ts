import chalk from "chalk";
import { execSync } from "child_process";
import { repoConfig } from "../lib/config";
import { ExitFailedError } from "../lib/errors";
import { tracer } from "../lib/telemetry";
import { getCommitterDate, getTrunk, gpExecSync } from "../lib/utils";
import { logDebug } from "../lib/utils/splog";
import Commit from "./commit";

type TMeta = {
  parentBranchName?: string;
  prevRef?: string;
  prInfo?: {
    number: number;
    url: string;
  };
};

function gitTreeFromRevListOutput(output: string): Record<string, string[]> {
  const ret: Record<string, string[]> = {};
  for (const line of output.split("\n")) {
    if (line.length > 0) {
      const shas = line.split(" ");
      ret[shas[0]] = shas.slice(1);
    }
  }

  return ret;
}

let memoizedChildrenRevListGitTree: Record<string, string[]>;
function getChildrenRevListGitTree(opts: {
  useMemoizedResult?: boolean;
}): Record<string, string[]> {
  if (opts.useMemoizedResult && memoizedChildrenRevListGitTree !== undefined) {
    return memoizedChildrenRevListGitTree;
  }

  memoizedChildrenRevListGitTree = gitTreeFromRevListOutput(
    execSync(`git rev-list --children --all`, {
      maxBuffer: 1024 * 1024 * 1024,
    })
      .toString()
      .trim()
  );

  return memoizedChildrenRevListGitTree;
}

let memoizedParentRevListGitTree: Record<string, string[]>;
function getParentRevListGitTree(opts: {
  useMemoizedResult?: boolean;
}): Record<string, string[]> {
  if (opts.useMemoizedResult && memoizedParentRevListGitTree !== undefined) {
    return memoizedParentRevListGitTree;
  }

  memoizedParentRevListGitTree = gitTreeFromRevListOutput(
    execSync(`git rev-list --parents --all`, {
      maxBuffer: 1024 * 1024 * 1024,
    })
      .toString()
      .trim()
  );

  return memoizedParentRevListGitTree;
}

function branchListFromShowRefOutput(output: string): Record<string, string[]> {
  const ret: Record<string, string[]> = {};
  const ignorebranches = repoConfig.getIgnoreBranches();

  for (const line of output.split("\n")) {
    if (line.length > 0) {
      const parts = line.split(" ");
      const branchName = parts[1].slice("refs/heads/".length);
      const branchRef = parts[0];
      if (!ignorebranches.includes(branchName)) {
        if (branchRef in ret) {
          ret[branchRef].push(branchName);
        } else {
          ret[branchRef] = [branchName];
        }
      }
    }
  }

  return ret;
}

let memoizedBranchList: Record<string, string[]>;
function getBranchList(opts: {
  useMemoizedResult?: boolean;
}): Record<string, string[]> {
  if (opts.useMemoizedResult && memoizedBranchList !== undefined) {
    return memoizedBranchList;
  }

  memoizedBranchList = branchListFromShowRefOutput(
    execSync("git show-ref --heads", {
      maxBuffer: 1024 * 1024 * 1024,
    })
      .toString()
      .trim()
  );

  return memoizedBranchList;
}

function traverseGitTreeFromCommitUntilBranch(
  commit: string,
  gitTree: Record<string, string[]>,
  branchList: Record<string, string[]>,
  n: number
): {
  branches: Set<string>;
  shortCircuitedDueToMaxDepth?: boolean;
} {
  // Skip the first iteration b/c that is the CURRENT branch
  if (n > 0 && commit in branchList) {
    return {
      branches: new Set(branchList[commit]),
    };
  }

  // Limit the seach
  const maxBranchLength = repoConfig.getMaxBranchLength();
  if (n > maxBranchLength) {
    return {
      branches: new Set(),
      shortCircuitedDueToMaxDepth: true,
    };
  }

  if (!gitTree[commit] || gitTree[commit].length == 0) {
    return {
      branches: new Set(),
    };
  }

  const commitsMatchingBranches = new Set<string>();
  let shortCircuitedDueToMaxDepth = undefined;
  for (const neighborCommit of gitTree[commit]) {
    const results = traverseGitTreeFromCommitUntilBranch(
      neighborCommit,
      gitTree,
      branchList,
      n + 1
    );

    const branches = results.branches;
    shortCircuitedDueToMaxDepth =
      results.shortCircuitedDueToMaxDepth || shortCircuitedDueToMaxDepth;

    if (branches.size !== 0) {
      branches.forEach((commit) => {
        commitsMatchingBranches.add(commit);
      });
    }
  }
  return {
    branches: commitsMatchingBranches,
    shortCircuitedDueToMaxDepth: shortCircuitedDueToMaxDepth,
  };
}

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
    return this.getChildrenOrParents({
      direction: "CHILDREN",
      useMemoizedResults: this.shouldUseMemoizedResults,
    });
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
    return this.getChildrenOrParents({
      direction: "PARENTS",
      useMemoizedResults: this.shouldUseMemoizedResults,
    });
  }

  private pointsToSameCommitAs(branch: Branch): boolean {
    return !!this.branchesWithSameCommit().find((b) => b.name === branch.name);
  }

  private getChildrenOrParents(opt: {
    direction: "CHILDREN" | "PARENTS";
    useMemoizedResults?: boolean;
  }): Branch[] {
    const direction = opt.direction;
    const useMemoizedResults = opt.useMemoizedResults ?? false;
    return tracer.spanSync(
      {
        name: "function",
        resource: "branch.getChildrenOrParents",
        meta: { direction: direction },
      },
      () => {
        const gitTree =
          direction === "CHILDREN"
            ? getChildrenRevListGitTree({
                useMemoizedResult: useMemoizedResults,
              })
            : getParentRevListGitTree({
                useMemoizedResult: useMemoizedResults,
              });

        const headSha = execSync(`git rev-parse ${this.name}`)
          .toString()
          .trim();

        const childrenOrParents = traverseGitTreeFromCommitUntilBranch(
          headSha,
          gitTree,
          getBranchList({ useMemoizedResult: useMemoizedResults }),
          0
        );

        if (childrenOrParents.shortCircuitedDueToMaxDepth) {
          logDebug(
            `${chalk.magenta(
              `Potential missing branch ${direction.toLocaleLowerCase()}:`
            )} Short-circuited search for branch ${chalk.bold(
              this.name
            )}'s ${direction.toLocaleLowerCase()} due to Graphite 'max-branch-length' setting. (Your Graphite CLI is currently configured to search a max of <${repoConfig.getMaxBranchLength()}> commits away from a branch's tip.) If this is causing an incorrect result (e.g. you know that ${
              this.name
            } has ${direction.toLocaleLowerCase()} ${
              repoConfig.getMaxBranchLength() + 1
            } commits away), please adjust the setting using \`gt repo max-branch-length\`.`
          );
        }

        return Array.from(childrenOrParents.branches).map((name) => {
          const branch = new Branch(name);
          return this.shouldUseMemoizedResults
            ? branch.useMemoizedResults()
            : branch;
        });
      }
    );
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
