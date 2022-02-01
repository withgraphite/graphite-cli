import { expect } from 'chai';
import { execSync } from 'child_process';
import fs from 'fs-extra';
import graphiteCLIRoutes from 'graphite-cli-routes';
import nock from 'nock';
import { API_SERVER } from '../../../../src/lib/api';
import { allScenes } from '../../../lib/scenes';
import {
  configureTest,
  expectBranches,
  expectCommits,
} from '../../../lib/utils';
import { fakeGitSquashAndMerge } from '../../../lib/utils/fake_squash_and_merge';

for (const scene of allScenes) {
  // eslint-disable-next-line max-lines-per-function
  describe(`(${scene}): repo sync`, function () {
    configureTest(this, scene);

    beforeEach(() => {
      // We need to stub out the endpoint that sends back information on
      // the GitHub PRs associated with each branch.
      nock(API_SERVER).post(graphiteCLIRoutes.pullRequestInfo.url).reply(200, {
        prs: [],
      });

      // Querying this endpoint requires a repo owner and name so we set
      // that here too. Note that these values are meaningless (for now)
      // and just need to exist.
      scene.repo.execCliCommand(`repo owner -s "integration_test"`);
      scene.repo.execCliCommand(`repo name -s "integration-test-repo"`);
    });

    afterEach(() => {
      nock.restore();
    });

    it('Can delete a single merged branch', async () => {
      scene.repo.createChange('2', 'a');
      scene.repo.execCliCommand(`branch create "a" -m "a" -q`);

      expectBranches(scene.repo, 'a, main');

      fakeGitSquashAndMerge(scene.repo, 'a', 'squash');
      scene.repo.execCliCommand(`repo sync -qf --no-pull --no-resubmit`);

      expectBranches(scene.repo, 'main');
    });

    it('Can noop sync if there are no stacks', () => {
      expect(() =>
        scene.repo.execCliCommand(`repo sync -qf --no-pull --no-resubmit`)
      ).to.not.throw(Error);
    });

    it('Can delete the foundation of a double stack', async () => {
      scene.repo.createChange('2', 'a');
      scene.repo.execCliCommand(`branch create "a" -m "a" -q`);

      scene.repo.createChange('3', 'b');
      scene.repo.execCliCommand(`branch create "b" -m "b" -q`);

      expectBranches(scene.repo, 'a, b, main');

      fakeGitSquashAndMerge(scene.repo, 'a', 'squash');
      scene.repo.execCliCommand(`repo sync -qf --no-pull --no-resubmit`);

      expectBranches(scene.repo, 'b, main');
      expectCommits(scene.repo, 'squash, 1');

      scene.repo.checkoutBranch('b');
      expectCommits(scene.repo, 'b, squash, 1');
    });

    it('Can delete two branches off a three-stack', async () => {
      scene.repo.createChange('2', 'a');
      scene.repo.execCliCommand(`branch create "a" -m "a" -q`);

      scene.repo.createChange('3', 'b');
      scene.repo.execCliCommand(`branch create "b" -m "b" -q`);

      scene.repo.createChange('4', 'c');
      scene.repo.execCliCommand(`branch create "c" -m "c" -q`);

      expectBranches(scene.repo, 'a, b, c, main');

      fakeGitSquashAndMerge(scene.repo, 'a', 'squash_a');
      fakeGitSquashAndMerge(scene.repo, 'b', 'squash_b');
      scene.repo.execCliCommand(`repo sync -qf --no-pull --no-resubmit`);

      expectBranches(scene.repo, 'c, main');
      expectCommits(scene.repo, 'squash_b, squash_a, 1');
    });

    it('Can delete two branches, while syncing inbetween, off a three-stack', async () => {
      scene.repo.createChange('2', 'a');
      scene.repo.execCliCommand(`branch create "a" -m "a" -q`);

      scene.repo.createChange('3', 'b');
      scene.repo.execCliCommand(`branch create "b" -m "b" -q`);

      scene.repo.createChange('4', 'c');
      scene.repo.execCliCommand(`branch create "c" -m "c" -q`);

      expectBranches(scene.repo, 'a, b, c, main');

      fakeGitSquashAndMerge(scene.repo, 'a', 'squash_a');
      scene.repo.execCliCommand(`repo sync -qf --no-pull --no-resubmit`);
      fakeGitSquashAndMerge(scene.repo, 'b', 'squash_b');
      scene.repo.execCliCommand(`repo sync -qf --no-pull --no-resubmit`);

      expectBranches(scene.repo, 'c, main');
      expectCommits(scene.repo, 'squash_b, squash_a, 1');

      const metadata = fs.readdirSync(
        `${scene.repo.dir}/.git/refs/branch-metadata`
      );

      expect(metadata.includes('a')).to.be.false;
      expect(metadata.includes('b')).to.be.false;
      expect(metadata.includes('c')).to.be.true;
    });

    /**
     * Removed this functionality for now - users are reporting issues where
     * this was incorrectly deleting metadata for still-existing branches.
     *
     * https://graphite-community.slack.com/archives/C02DRNRA9RA/p1632897956089100
     * https://graphite-community.slack.com/archives/C02DRNRA9RA/p1634168133170500"
     */
    xit('Deletes dangling metadata refs', async () => {
      scene.repo.createChange('a', 'a');
      scene.repo.execCliCommand(`branch create "a" -m "a" -q`);

      scene.repo.createChange('b', 'b');
      scene.repo.execCliCommand(`branch create "b" -m "b" -q`);

      scene.repo.checkoutBranch('main');
      execSync(`git -C "${scene.repo.dir}" branch -D a`);

      let metadata = fs.readdirSync(
        `${scene.repo.dir}/.git/refs/branch-metadata`
      );
      expect(metadata.includes('a')).to.be.true;
      expect(metadata.includes('b')).to.be.true;
      scene.repo.execCliCommand(`repo sync -qf --no-pull --no-resubmit`);

      metadata = fs.readdirSync(`${scene.repo.dir}/.git/refs/branch-metadata`);
      expect(metadata.includes('a')).to.be.false;
      expect(metadata.includes('b')).to.be.true;
    });

    xit('Can detect dead branches off multiple stacks', async () => {
      scene.repo.createChange('a', 'a');
      scene.repo.execCliCommand(`branch create "a" -m "a" -q`);

      scene.repo.createChange('b', 'b');
      scene.repo.execCliCommand(`branch create "b" -m "b" -q`);

      scene.repo.createChange('c', 'c');
      scene.repo.execCliCommand(`branch create "c" -m "c" -q`);

      expectBranches(scene.repo, 'a, b, c, main');

      scene.repo.checkoutBranch('main');

      scene.repo.createChange('d', 'd');
      scene.repo.execCliCommand(`branch create "d" -m "d" -q`);

      scene.repo.createChange('e', 'e');
      scene.repo.execCliCommand(`branch create "e" -m "e" -q`);

      fakeGitSquashAndMerge(scene.repo, 'a', 'squash_a');
      fakeGitSquashAndMerge(scene.repo, 'b', 'squash_b');
      fakeGitSquashAndMerge(scene.repo, 'd', 'squash_d');

      scene.repo.execCliCommand(`repo sync -qf --no-pull --no-resubmit`);

      expectBranches(scene.repo, 'c, e, main');
      scene.repo.checkoutBranch('main');
      expectCommits(scene.repo, 'squash_d, squash_b, squash_a');
      scene.repo.checkoutBranch('c');
      expectCommits(scene.repo, 'c, squash_d, squash_b, squash_a');
      scene.repo.checkoutBranch('e');
      expectCommits(scene.repo, 'e, squash_d, squash_b, squash_a');
    });

    it('Deletes merged, dangling branches that trail trunk', async () => {
      // We'll come back to this - for now we're just saving a place behind
      // main.
      scene.repo.createAndCheckoutBranch('dangling');

      scene.repo.checkoutBranch('main');
      scene.repo.createChangeAndCommit('2', '2');
      scene.repo.createChangeAndCommit('3', '3');
      scene.repo.createChangeAndCommit('4', '4');

      // Now create the dangling branch that trails main.
      scene.repo.checkoutBranch('dangling');
      scene.repo.createChangeAndCommit('a', 'a');

      scene.repo.checkoutBranch('main');

      expectBranches(scene.repo, 'dangling, main');

      fakeGitSquashAndMerge(scene.repo, 'dangling', 'squash_dangling');

      // The idea here is that repo sync fixes dangling branch back onto main,
      // which then gets deleted as the deletion logic makes a pass through
      // all of trunk's children.
      scene.repo.execCliCommand(`repo sync -qf --no-pull --no-resubmit`);
      expectBranches(scene.repo, 'main');
    });
  });
}
