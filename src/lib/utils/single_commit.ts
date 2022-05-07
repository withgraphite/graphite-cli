import { Branch } from '../../wrapper-classes/branch';
import { Commit } from '../../wrapper-classes/commit';
import { TContext } from '../context';

export function getSingleCommitOnBranch(
  branch: Branch,
  context: TContext
): Commit | null {
  const commits = branch.getCommitSHAs(context);
  if (commits.length !== 1) {
    return null;
  }
  return new Commit(commits[0]);
}
