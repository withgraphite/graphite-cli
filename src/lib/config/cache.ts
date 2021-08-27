type branchRefsT = {
  branchToRef: Record<string, string>;
  refToBranches: Record<string, string[]>;
};
let branchRefs: branchRefsT | undefined = undefined;

type revListT = Record<string, string[]>;

let parentsRevList: revListT | undefined = undefined;

let childrenRevList: revListT | undefined = undefined;

let repoRootPath: string | undefined = undefined;

class Cache {
  public getRepoRootPath(): string | undefined {
    return repoRootPath;
  }

  public getBranchToRef(): Record<string, string> | undefined {
    return branchRefs?.branchToRef;
  }

  public getRefToBranches(): Record<string, string[]> | undefined {
    return branchRefs?.refToBranches;
  }

  public getParentsRevList(): Record<string, string[]> | undefined {
    return parentsRevList;
  }

  public getChildrenRevList(): Record<string, string[]> | undefined {
    return childrenRevList;
  }

  clearAll(): void {
    branchRefs = undefined;
    parentsRevList = undefined;
    childrenRevList = undefined;
  }

  clearBranchRefs(): void {
    branchRefs = undefined;
  }

  setParentsRevList(newRevList: revListT): void {
    parentsRevList = newRevList;
  }

  setChildrenRevList(newRevList: revListT): void {
    childrenRevList = newRevList;
  }

  setBranchRefs(newBranchRefs: branchRefsT): void {
    branchRefs = newBranchRefs;
  }

  setRepoRootPath(newRepoRootPath: string): void {
    repoRootPath = newRepoRootPath;
  }
}

const cache = new Cache();

export default cache;
