import { Branch } from '../../wrapper-classes/branch';

type branchRefsT = {
  branchToRef: Record<string, string>;
  refToBranches: Record<string, string[]>;
};
let branchRefs: branchRefsT | undefined = undefined;

type revListT = Record<string, string[]>;

let parentsRevList: revListT | undefined = undefined;

let childrenRevList: revListT | undefined = undefined;

let metaChildren: Record<string, Branch[]> | undefined = undefined;

let branchList: Record<string, string[]> | undefined = undefined;

class Cache {
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

  public getMetaChildren(): Record<string, Branch[]> | undefined {
    return metaChildren;
  }

  public getBranchList(): Record<string, string[]> | undefined {
    return branchList;
  }

  clearAll(): void {
    branchRefs = undefined;
    parentsRevList = undefined;
    childrenRevList = undefined;
    metaChildren = undefined;
    branchList = undefined;
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

  setMetaChildren(newMetaChildren: Record<string, Branch[]>): void {
    metaChildren = newMetaChildren;
  }

  setBranchList(newBranchList: Record<string, string[]>): void {
    branchList = newBranchList;
  }
}

export const cache = new Cache();
