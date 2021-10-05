import { Branch, Commit } from "../../wrapper-classes";

export function getSingleCommitOnBranch(branch: Branch): Commit | null {
  const commits = branch.getCommitSHAs();
  if (commits.length !== 1) {
    return null;
  }
  return new Commit(commits[0]);
}
