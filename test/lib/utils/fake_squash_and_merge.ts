import { execSync } from 'child_process';
import { GitRepo } from '../../../src/lib/utils/git_repo';

export function fakeGitSquashAndMerge(
  repo: GitRepo,
  branchName: string,
  squashedCommitMessage: string
): void {
  // Fake github squash and merge
  execSync(`git -C "${repo.dir}" switch -q -c temp ${branchName}`);
  execSync(`git -C "${repo.dir}" rebase main -Xtheirs`);
  execSync(
    `git -C "${repo.dir}" reset --soft $(git -C "${repo.dir}" merge-base HEAD main)`
  );
  repo.checkoutBranch('main');
  execSync(`git -C "${repo.dir}" commit -m "${squashedCommitMessage}"`);
  execSync(`git -C "${repo.dir}" branch -D temp`);
}
