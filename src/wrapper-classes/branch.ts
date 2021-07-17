import { execSync } from "child_process";
import Commit from "./commit";

type TBranchDesc = {
  parentBranchName: string;
};

export const MAX_COMMITS_TO_TRAVERSE_FOR_NEXT_OR_PREV = 50;

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

function branchListFromShowRefOutput(output: string): Record<string, string> {
  const ret: Record<string, string> = {};
  for (const line of output.split("\n")) {
    if (line.length > 0) {
      const parts = line.split(" ");
      ret[parts[0]] = parts[1].slice("refs/heads/".length);
    }
  }

  return ret;
}

function traverseGitTreeFromCommitUntilBranch(
  commit: string,
  gitTree: Record<string, string[]>,
  branchList: Record<string, string>,
  n: number
): Set<string> | null {
  // Skip the first iteration b/c that is the CURRENT branch
  if (n > 0 && commit in branchList) {
    return new Set([branchList[commit]]);
  }

  // Limit the seach
  if (n > MAX_COMMITS_TO_TRAVERSE_FOR_NEXT_OR_PREV) {
    return null;
  }

  if (!gitTree[commit] || gitTree[commit].length == 0) {
    return null;
  }

  const commitsMatchingBranches = new Set<string>();
  for (const neighborCommit of gitTree[commit]) {
    const discoveredMatches = traverseGitTreeFromCommitUntilBranch(
      neighborCommit,
      gitTree,
      branchList,
      n + 1
    );
    if (discoveredMatches === null) {
      return null;
    } else {
      discoveredMatches.forEach((commit) => {
        commitsMatchingBranches.add(commit);
      });
    }
  }
  return commitsMatchingBranches;
}

export default class Branch {
  name: string;

  constructor(name: string) {
    this.name = name;
  }

  public toString(): string {
    return this.name;
  }

  private getMeta(): TBranchDesc | undefined {
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

  private writeMeta(desc: TBranchDesc) {
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
    if (gitParents && gitParents.length === 1) {
      return this.stackByTracingMetaParents(gitParents[0]).concat([
        curBranch.name,
      ]);
    } else {
      return [curBranch.name];
    }
  }

  getParentFromMeta(): Branch | undefined {
    const parentName = this.getMeta()?.parentBranchName;
    if (parentName) {
      return new Branch(parentName);
    }
    return undefined;
  }

  static allBranches(): Branch[] {
    return execSync(`git for-each-ref --format='%(refname:short)' refs/heads/`)
      .toString()
      .trim()
      .split("\n")
      .map((name) => new Branch(name));
  }

  async getChildrenFromMeta(): Promise<Branch[]> {
    const children = Branch.allBranches().filter(
      (b) => b.getMeta()?.parentBranchName === this.name
    );
    return children;
  }

  public setParentBranchName(parentBranchName: string) {
    this.writeMeta({ parentBranchName });
  }

  public getTrunkBranchFromGit(): Branch {
    const gitParents = this.getParentsFromGit();
    if (gitParents && gitParents.length == 1) {
      return gitParents[0].getTrunkBranchFromGit();
    } else if (gitParents && gitParents.length > 1) {
      console.log(
        `Cannot derive trunk from git branch (${this.name}) with two parents`
      );
      process.exit(1);
    } else {
      return this;
    }
  }

  static async branchWithName(name: string): Promise<Branch> {
    const branch = Branch.allBranches().find((b) => b.name === name);
    if (!branch) {
      throw new Error(`Failed to find branch named ${name}`);
    }
    return new Branch(name);
  }

  static async getCurrentBranch(): Promise<Branch> {
    return new Branch(
      execSync(`git rev-parse --abbrev-ref HEAD`).toString().trim()
    );
  }

  static async getAllBranchesWithoutParents(): Promise<Branch[]> {
    return Branch.allBranches().filter((b) => {
      const parents = b.getParentsFromGit();
      return parents == undefined || parents.length > 0;
    });
  }

  static async getAllBranchesWithParents(): Promise<Branch[]> {
    return Branch.allBranches().filter((b) => {
      const parents = b.getParentsFromGit();
      return parents != undefined && parents.length > 0;
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

  public getChildrenFromGit(): Branch[] | undefined {
    return this.getChildrenOrParents("CHILDREN");
  }

  public getParentsFromGit(): Branch[] | undefined {
    return this.getChildrenOrParents("PARENTS");
  }

  private getChildrenOrParents(
    opt: "CHILDREN" | "PARENTS"
  ): Branch[] | undefined {
    const revListOutput = execSync(
      `git rev-list ${opt === "CHILDREN" ? "--children" : "--parents"} --all`,
      {
        maxBuffer: 1024 * 1024 * 1024,
      }
    );
    const gitTree = gitTreeFromRevListOutput(revListOutput.toString().trim());

    const showRefOutput = execSync("git show-ref --heads", {
      maxBuffer: 1024 * 1024 * 1024,
    });
    const branchList = branchListFromShowRefOutput(
      showRefOutput.toString().trim()
    );

    const headSha = execSync(`git rev-parse ${this.name}`).toString().trim();

    const candidates = traverseGitTreeFromCommitUntilBranch(
      headSha,
      gitTree,
      branchList,
      0
    );

    if (candidates === null) {
      return undefined;
    }

    return Array.from(candidates.values()).map((c) => new Branch(c));
  }
}
