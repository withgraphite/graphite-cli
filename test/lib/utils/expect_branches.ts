import { expect } from 'chai';
import { execSync } from 'child_process';
import { GitRepo } from '../../../src/lib/utils';

export function expectBranches(repo: GitRepo, sortedBranches: string): void {
  expect(
    execSync(
      `git -C "${repo.dir}" for-each-ref refs/heads/ "--format=%(refname:short)"`
    )
      .toString()
      .trim()
      .split('\n')
      .filter((b) => b !== 'prod') // scene related branch
      .filter((b) => b !== 'x2') // scene related branch
      .sort()
      .join(', ')
  ).to.equal(sortedBranches);
}
