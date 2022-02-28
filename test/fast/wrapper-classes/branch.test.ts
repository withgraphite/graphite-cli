import { expect } from 'chai';
import { Branch } from '../../../src/wrapper-classes/branch';
import { allScenes } from '../../lib/scenes';
import { configureTest } from '../../lib/utils';

for (const scene of allScenes) {
  describe(`(${scene}): branch class`, function () {
    configureTest(this, scene);

    it('Can list git parent for a branch', () => {
      scene.repo.createChange('2');
      scene.repo.execCliCommand(`branch create a -m "a" -q`);

      const branch = new Branch('a');
      expect(branch.getParentsFromGit(scene.context)[0].name).to.equal('main');
    });

    it('Can list parent based on meta for a branch', () => {
      scene.repo.createChange('2');
      scene.repo.execCliCommand(`branch create "a" -m "a" -q`);

      const branch = new Branch('a');
      expect(branch.getParentFromMeta(scene.context)).is.not.undefined;
      expect(branch.getParentFromMeta(scene.context)?.name).to.equal('main');
    });

    it('Can fetch branches that point to the same commit', () => {
      scene.repo.createAndCheckoutBranch('a');
      scene.repo.createChangeAndCommit('2');
      scene.repo.createAndCheckoutBranch('b');
      scene.repo.createAndCheckoutBranch('c');
      expect(
        new Branch('a')
          .branchesWithSameCommit(scene.context)
          .map((b) => b.name)
          .sort()
          .join(', ')
      ).to.eq('b, c');
    });
  });
}
