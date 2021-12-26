import { expect } from 'chai';
import { validate, validateStack } from '../../../src/actions/validate';
import { cache } from '../../../src/lib/config';
import { allScenes, BasicScene, TrailingProdScene } from '../../lib/scenes';
import { configureTest } from '../../lib/utils';
import { MetaStackBuilder, Stack } from '../../../src/wrapper-classes';
import { currentBranchPrecondition } from '../../../src/lib/preconditions';
import Branch from '../../../src/wrapper-classes/branch';

function setupScene(scene: BasicScene | TrailingProdScene) {
  scene.repo.createChange('a');
  scene.repo.execCliCommand(`branch create "a" -m "a" -q`);

  scene.repo.createAndCheckoutBranch('b');
  scene.repo.createChangeAndCommit('1');

  scene.repo.createChange('c');
  scene.repo.execCliCommand(`branch create "c" -m "c" -q`);

  scene.repo.createChange('d');
  scene.repo.execCliCommand(`branch create "d" -m "d" -q`);
}

for (const scene of allScenes) {
  describe(`(${scene}): validate action`, function () {
    configureTest(this, scene);

    it('Can validate upstack', async () => {
      setupScene(scene);
      let branch: Branch;
      let stack: Stack;

      scene.repo.checkoutBranch('a');
      expect(() => validate('UPSTACK')).to.throw(Error);
      branch = currentBranchPrecondition();
      stack = new MetaStackBuilder().upstackInclusiveFromBranchWithParents(
        branch
      );
      expect(() => validateStack('UPSTACK', stack)).to.throw(Error);

      scene.repo.checkoutBranch('b');
      expect(() => validate('UPSTACK')).to.not.throw(Error);
      branch = currentBranchPrecondition();
      stack = new MetaStackBuilder().upstackInclusiveFromBranchWithParents(
        branch
      );
      expect(() => validateStack('UPSTACK', stack)).to.not.throw(Error);

      scene.repo.checkoutBranch('c');
      expect(() => validate('UPSTACK')).to.not.throw(Error);
      branch = currentBranchPrecondition();
      stack = new MetaStackBuilder().upstackInclusiveFromBranchWithParents(
        branch
      );
      expect(() => validateStack('UPSTACK', stack)).to.not.throw(Error);

      scene.repo.checkoutBranch('d');
      expect(() => validate('UPSTACK')).to.not.throw(Error);
      branch = currentBranchPrecondition();
      stack = new MetaStackBuilder().upstackInclusiveFromBranchWithParents(
        branch
      );
      expect(() => validateStack('UPSTACK', stack)).to.not.throw(Error);
    });

    it('Can validate downstack', async () => {
      setupScene(scene);
      let branch: Branch;
      let metaStack: Stack;

      scene.repo.checkoutBranch('a');
      expect(() => validate('DOWNSTACK')).to.not.throw(Error);
      branch = currentBranchPrecondition();
<<<<<<< HEAD
      metaStack = new MetaStackBuilder().downstackFromBranch(branch);
=======
      metaStack = new MetaStackBuilder().upstackInclusiveFromBranchWithParents(
        branch
      );
>>>>>>> 9d28226 (fix(validate): add tests to validateStack)
      expect(() => validateStack('DOWNSTACK', metaStack)).to.not.throw(Error);

      scene.repo.checkoutBranch('b');
      expect(() => validate('DOWNSTACK')).to.throw(Error);
      branch = currentBranchPrecondition();
<<<<<<< HEAD
      metaStack = new MetaStackBuilder().downstackFromBranch(branch);
=======
      metaStack = new MetaStackBuilder().upstackInclusiveFromBranchWithParents(
        branch
      );
>>>>>>> 9d28226 (fix(validate): add tests to validateStack)
      expect(() => validateStack('DOWNSTACK', metaStack)).to.throw(Error);

      scene.repo.checkoutBranch('c');
      expect(() => validate('DOWNSTACK')).to.throw(Error);
      branch = currentBranchPrecondition();
<<<<<<< HEAD
      metaStack = new MetaStackBuilder().downstackFromBranch(branch);
=======
      metaStack = new MetaStackBuilder().upstackInclusiveFromBranchWithParents(
        branch
      );
>>>>>>> 9d28226 (fix(validate): add tests to validateStack)
      expect(() => validateStack('DOWNSTACK', metaStack)).to.throw(Error);

      scene.repo.checkoutBranch('d');
      expect(() => validate('DOWNSTACK')).to.throw(Error);
      branch = currentBranchPrecondition();
<<<<<<< HEAD
      metaStack = new MetaStackBuilder().downstackFromBranch(branch);
=======
      metaStack = new MetaStackBuilder().upstackInclusiveFromBranchWithParents(
        branch
      );
>>>>>>> 9d28226 (fix(validate): add tests to validateStack)
      expect(() => validateStack('DOWNSTACK', metaStack)).to.throw(Error);
    });

    it('Can validate fullstack', async () => {
      let branch: Branch;
      let metaStack: Stack;
      scene.repo.createChange('a');
      scene.repo.execCliCommand(`branch create "a" -m "a" -q`);
      cache.clearAll();
      expect(() => validate('FULLSTACK')).to.not.throw(Error);
      branch = currentBranchPrecondition();
      metaStack = new MetaStackBuilder().fullStackFromBranch(branch);
      expect(() => validateStack('FULLSTACK', metaStack)).to.not.throw(Error);

      scene.repo.createChange('b');
      scene.repo.execCliCommand(`branch create "b" -m "b" -q`);
      cache.clearAll();
      expect(() => validate('FULLSTACK')).to.not.throw(Error);
      branch = currentBranchPrecondition();
      metaStack = new MetaStackBuilder().fullStackFromBranch(branch);
      expect(() => validateStack('FULLSTACK', metaStack)).to.not.throw(Error);

      scene.repo.createAndCheckoutBranch('c');
      scene.repo.createChangeAndCommit('c');
      cache.clearAll();
      expect(() => validate('FULLSTACK')).to.throw(Error);
<<<<<<< HEAD
=======

>>>>>>> 9d28226 (fix(validate): add tests to validateStack)
      branch = currentBranchPrecondition();
      metaStack = new MetaStackBuilder().fullStackFromBranch(branch);
      expect(() => validateStack('FULLSTACK', metaStack)).to.throw(Error);
    });
  });
}
