import { execSync } from 'child_process';
import { writeMetadataRef } from '../../../src/lib/engine/metadata_ref';
import { getShaOrThrow } from '../../../src/lib/git/get_sha';
import { AbstractScene } from './abstract_scene';

export class TrailingProdScene extends AbstractScene {
  public toString(): string {
    return 'TrailingProdScene';
  }

  public setup(): void {
    super.setup();
    this.repo.createChangeAndCommit('0');
    this.repo.createAndCheckoutBranch('prod');
    this.repo.createChangeAndCommit('prod', 'prod');

    this.repo.checkoutBranch('main');
    this.repo.createChangeAndCommit('0.5', '0.5');

    // Create a dangling branch as well, to cause a little chaos.
    this.repo.createAndCheckoutBranch('x1');
    this.repo.createChangeAndCommit('x1', 'x1');
    this.repo.createAndCheckoutBranch('x2');
    this.repo.createChangeAndCommit('x2', 'x2');
    writeMetadataRef(
      'x2',
      {
        parentBranchName: 'x1',
        parentBranchRevision: getShaOrThrow('x1'),
      },
      this.repo.dir
    );
    this.repo.deleteBranch('x1');

    execSync(`git -C "${this.dir}" merge prod`);

    this.repo.checkoutBranch('main');
    this.repo.createChangeAndCommit('1', '1');
    this.repo.execCliCommand('repo init --trunk main --no-interactive');
  }
}
