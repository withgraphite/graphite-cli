import Branch from '../../wrapper-classes/branch';
import { repoConfig } from '../config';
import cache from '../config/cache';
import { ExitFailedError } from '../errors';
import { gpExecSync } from '../utils';

function refreshRefsCache(): void {
  cache.clearBranchRefs();
  const memoizedRefToBranches: Record<string, string[]> = {};
  const memoizedBranchToRef: Record<string, string> = {};
  gpExecSync({
    command: `git show-ref --heads`,
  })
    .toString()
    .trim()
    .split('\n')
    .filter((line) => line.length > 0)
    .forEach((line) => {
      const pair = line.split(' ');
      if (pair.length !== 2) {
        throw new ExitFailedError('Unexpected git ref output');
      }
      const ref = pair[0];
      const branchName = pair[1].replace('refs/heads/', '');
      if (repoConfig.isNotIgnoredBranch(branchName)) {
        memoizedRefToBranches[ref]
          ? memoizedRefToBranches[ref].push(branchName)
          : (memoizedRefToBranches[ref] = [branchName]);
        memoizedBranchToRef[branchName] = ref;
      }
    });
  cache.setBranchRefs({
    branchToRef: memoizedBranchToRef,
    refToBranches: memoizedRefToBranches,
  });
}

export function getBranchToRefMapping(): Record<string, string> {
  if (!cache.getBranchToRef()) {
    refreshRefsCache();
  }
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return cache.getBranchToRef()!;
}
export function getRef(branch: Branch): string {
  if (!branch.shouldUseMemoizedResults || !cache.getBranchToRef()) {
    refreshRefsCache();
  }
  const ref = cache.getBranchToRef()?.[branch.name];
  if (!ref) {
    throw new ExitFailedError(`Failed to find ref for ${branch.name}`);
  }
  return ref;
}
export function otherBranchesWithSameCommit(branch: Branch): Branch[] {
  if (!branch.shouldUseMemoizedResults || !cache.getRefToBranches()) {
    refreshRefsCache();
  }
  const ref = branch.ref();
  const branchNames = cache.getRefToBranches()?.[ref];
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
