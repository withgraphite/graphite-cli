import { API_ROUTES } from '@withgraphite/graphite-cli-routes';
import { expect } from 'chai';
import nock from 'nock';
import { API_SERVER } from '../../../src/lib/api/server';
import { allScenes } from '../../lib/scenes/all_scenes';
import { configureTest } from '../../lib/utils/configure_test';
import { expectBranches } from '../../lib/utils/expect_branches';
import { fakeGitSquashAndMerge } from '../../lib/utils/fake_squash_and_merge';

for (const scene of allScenes) {
  // eslint-disable-next-line max-lines-per-function
  describe(`(${scene}): repo sync continue`, function () {
    configureTest(this, scene);

    beforeEach(() => {
      // We need to stub out the endpoint that sends back information on
      // the GitHub PRs associated with each branch.
      nock(API_SERVER).post(API_ROUTES.pullRequestInfo.url).reply(200, {
        prs: [],
      });

      // Querying this endpoint requires a repo owner and name so we set
      // that here too. Note that these values are meaningless (for now)
      // and just need to exist.
      scene.repo.runCliCommandAndGetOutput([
        `repo`,
        `owner`,
        `-s`,
        `integration_test`,
      ]);
      scene.repo.runCliCommandAndGetOutput([
        `repo`,
        `name`,
        `-s`,
        `integration_test`,
      ]);
    });

    afterEach(() => {
      nock.restore();
    });

    it('Can continue a repo sync with one merge conflict', async () => {
      scene.repo.checkoutBranch('main');
      scene.repo.createChange('a', 'file_with_no_merge_conflict_a');
      scene.repo.runCliCommand([`branch`, `create`, `a`, `-m`, `a`]);

      scene.repo.checkoutBranch('main');
      scene.repo.createChange('b', 'file_with_no_merge_conflict_b');
      scene.repo.runCliCommand([`branch`, `create`, `b`, `-m`, `b`]);

      scene.repo.createChange('c', 'file_with_merge_conflict');
      scene.repo.runCliCommand([`branch`, `create`, `c`, `-m`, `c`]);

      scene.repo.checkoutBranch('main');
      scene.repo.createChange('d', 'file_with_merge_conflict');
      scene.repo.runCliCommand([`branch`, `create`, `d`, `-m`, `d`]);

      scene.repo.checkoutBranch('main');
      scene.repo.createChange('e', 'file_with_no_merge_conflict_e');
      scene.repo.runCliCommand([`branch`, `create`, `e`, `-m`, `e`]);

      expectBranches(scene.repo, 'a, b, c, d, e, main');

      // Squashing all but branch (c) which will have a merge conflict when
      // it's rebased onto trunk.
      fakeGitSquashAndMerge(scene.repo, 'a', 'squash');
      fakeGitSquashAndMerge(scene.repo, 'b', 'squash');
      fakeGitSquashAndMerge(scene.repo, 'd', 'squash');
      fakeGitSquashAndMerge(scene.repo, 'e', 'squash');

      expect(() =>
        scene.repo.runCliCommand([
          `repo`,
          `sync`,
          `-f`,
          `--no-pull`,
          `--restack`,
        ])
      ).to.throw();
      expect(scene.repo.rebaseInProgress()).to.be.true;

      scene.repo.resolveMergeConflicts();
      scene.repo.markMergeConflictsAsResolved();
      scene.repo.runCliCommand(['continue']);

      expectBranches(scene.repo, 'c, main');
    });

    it('Can continue a repo sync with multiple merge conflicts', () => {
      scene.repo.checkoutBranch('main');
      scene.repo.createChange('a', 'file_with_no_merge_conflict_a');
      scene.repo.runCliCommand([`branch`, `create`, `a`, `-m`, `a`]);

      scene.repo.checkoutBranch('main');
      scene.repo.createChange('b', 'file_with_no_merge_conflict_b');
      scene.repo.runCliCommand([`branch`, `create`, `b`, `-m`, `b`]);

      scene.repo.createChange('c', 'file_with_merge_conflict_1');
      scene.repo.runCliCommand([`branch`, `create`, `c`, `-m`, `c`]);

      scene.repo.createChange('d', 'file_with_merge_conflict_2');
      scene.repo.runCliCommand([`branch`, `create`, `d`, `-m`, `d`]);

      scene.repo.checkoutBranch('main');
      scene.repo.createChange('e', 'file_with_merge_conflict_1');
      scene.repo.runCliCommand([`branch`, `create`, `e`, `-m`, `e`]);

      scene.repo.checkoutBranch('main');
      scene.repo.createChange('f', 'file_with_merge_conflict_2');
      scene.repo.runCliCommand([`branch`, `create`, `f`, `-m`, `f`]);

      expectBranches(scene.repo, 'a, b, c, d, e, f, main');

      fakeGitSquashAndMerge(scene.repo, 'a', 'squash');
      fakeGitSquashAndMerge(scene.repo, 'b', 'squash');
      fakeGitSquashAndMerge(scene.repo, 'e', 'squash');
      fakeGitSquashAndMerge(scene.repo, 'f', 'squash');

      expect(() =>
        scene.repo.runCliCommand([
          `repo`,
          `sync`,
          `-f`,
          `--no-pull`,
          `--restack`,
        ])
      ).to.throw();
      expect(scene.repo.rebaseInProgress()).to.be.true;

      scene.repo.resolveMergeConflicts();
      scene.repo.markMergeConflictsAsResolved();

      expect(() => scene.repo.runCliCommand(['continue'])).to.throw();
      expect(scene.repo.rebaseInProgress()).to.be.true;

      scene.repo.resolveMergeConflicts();
      scene.repo.markMergeConflictsAsResolved();
      scene.repo.runCliCommand(['continue']);

      expectBranches(scene.repo, 'c, d, main');
    });
  });
}
