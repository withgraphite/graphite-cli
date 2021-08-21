import Branch from "../../wrapper-classes/branch";
import { ExitFailedError } from "../errors";
import { gpExecSync } from "../utils";

let memoizedBranchToRef: Record<string, string> | undefined = undefined;
let memoizedRefToBranches: Record<string, string[]> | undefined = undefined;

function refreshRefsInMemory(): void {
  memoizedRefToBranches = {};
  memoizedBranchToRef = {};
  gpExecSync({
    command: `git show-ref --heads`,
  })
    .toString()
    .trim()
    .split("\n")
    .filter((line) => line.length > 0)
    .forEach((line) => {
      const pair = line.split(" ");
      if (pair.length !== 2) {
        throw new ExitFailedError("Unexpected git ref output");
      }
      const ref = pair[0];
      const branchName = pair[1].replace("refs/heads/", "");
      memoizedRefToBranches![ref]
        ? memoizedRefToBranches![ref].push(branchName)
        : (memoizedRefToBranches![ref] = [branchName]);

      memoizedBranchToRef![branchName] = ref;
    });
}
export function getRef(branch: Branch): string {
  if (!branch.shouldUseMemoizedResults || !memoizedBranchToRef) {
    refreshRefsInMemory();
  }
  const ref = memoizedBranchToRef?.[branch.name];
  if (!ref) {
    throw new ExitFailedError(`Failed to find ref for ${branch.name}`);
  }
  return ref;
}
export function otherBranchesWithSameCommit(branch: Branch): Branch[] {
  if (
    !branch.shouldUseMemoizedResults ||
    !memoizedRefToBranches ||
    !memoizedBranchToRef
  ) {
    refreshRefsInMemory();
  }
  const ref = branch.ref();
  const branchNames = memoizedRefToBranches?.[ref];
  if (!branchNames) {
    throw new ExitFailedError(`Failed to find branches for ref ${ref}`);
  }

  return branchNames
    .filter((bn) => bn !== branch.name)
    .map(
      (bn) =>
        new Branch(bn, {
          useMemoizedResults: branch.shouldUseMemoizedResults,
        })
    );
}
