import Branch from '../../wrapper-classes/branch';
import cache from '../config/cache';
import { TContext } from '../context/context';
import { ExitFailedError } from '../errors';
import { gpExecSync } from '../utils';

function refreshRefsCache(context: TContext): void {
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
      if (!context.repoConfig.branchIsIgnored(branchName)) {
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

export function getBranchToRefMapping(
  context: TContext
): Record<string, string> {
  if (!cache.getBranchToRef()) {
    refreshRefsCache(context);
  }
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return cache.getBranchToRef()!;
}
export function getRef(branch: Branch, context: TContext): string {
  if (!branch.shouldUseMemoizedResults || !cache.getBranchToRef()) {
    refreshRefsCache(context);
  }
  const ref = cache.getBranchToRef()?.[branch.name];
  if (!ref) {
    throw new ExitFailedError(`Failed to find ref for ${branch.name}`);
  }
  return ref;
}
export function otherBranchesWithSameCommit(
  branch: Branch,
  context: TContext
): Branch[] {
  if (!branch.shouldUseMemoizedResults || !cache.getRefToBranches()) {
    refreshRefsCache(context);
  }
  const ref = branch.ref(context);
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
