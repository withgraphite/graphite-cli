import { expect } from 'chai';
import { allScenes } from '../../lib/scenes/all_scenes';
import { configureTest } from '../../lib/utils/configure_test';

for (const scene of allScenes) {
  describe(`(${scene}): branch track`, function () {
    configureTest(this, scene);
    it('can force track a series of 3 branches', () => {
      // Create our branch
      scene.repo.createAndCheckoutBranch('a');
      scene.repo.createChangeAndCommit('a', 'a');
      scene.repo.createAndCheckoutBranch('b');
      scene.repo.createChangeAndCommit('b', 'b');
      scene.repo.createAndCheckoutBranch('c');
      scene.repo.createChangeAndCommit('c', 'c');

      expect(() => {
        scene.repo.runCliCommand(['downstack', 'track', '-f']);
      }).not.to.throw();

      expect(() => {
        scene.repo.runCliCommand([`branch`, `down`]);
      }).not.to.throw();
      expect(scene.repo.currentBranchName()).to.eq('b');

      expect(() => {
        scene.repo.runCliCommand([`branch`, `down`]);
      }).not.to.throw();
      expect(scene.repo.currentBranchName()).to.eq('a');

      expect(() => {
        scene.repo.runCliCommand([`branch`, `down`]);
      }).not.to.throw();
      expect(scene.repo.currentBranchName()).to.eq('main');
    });

    it('can force track a series of 3 branches from main', () => {
      // Create our branch
      scene.repo.createAndCheckoutBranch('a');
      scene.repo.createChangeAndCommit('a', 'a');
      scene.repo.createAndCheckoutBranch('b');
      scene.repo.createChangeAndCommit('b', 'b');
      scene.repo.createAndCheckoutBranch('c');
      scene.repo.createChangeAndCommit('c', 'c');
      scene.repo.checkoutBranch('main');

      expect(() => {
        scene.repo.runCliCommand(['downstack', 'track', '-f', 'c']);
      }).not.to.throw();

      expect(() => {
        scene.repo.runCliCommand([`branch`, `up`]);
      }).not.to.throw();
      expect(scene.repo.currentBranchName()).to.eq('a');

      expect(() => {
        scene.repo.runCliCommand([`branch`, `up`]);
      }).not.to.throw();
      expect(scene.repo.currentBranchName()).to.eq('b');

      expect(() => {
        scene.repo.runCliCommand([`branch`, `up`]);
      }).not.to.throw();
      expect(scene.repo.currentBranchName()).to.eq('c');
    });
  });
}
