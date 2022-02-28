import { expect } from 'chai';
import { validate, validateStack } from '../../../src/actions/validate';
import { cache } from '../../../src/lib/config/cache';
import { currentBranchPrecondition } from '../../../src/lib/preconditions';
import { MetaStackBuilder, Stack } from '../../../src/wrapper-classes';
import Branch from '../../../src/wrapper-classes/branch';
import { allScenes, BasicScene, TrailingProdScene } from '../../lib/scenes';
import { configureTest } from '../../lib/utils';

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
  // eslint-disable-next-line max-lines-per-function
  describe(`(${scene}): validate action`, function () {
    configureTest(this, scene);

    it('Can validate upstack', async () => {
      setupScene(scene);
      let branch: Branch;
      let stack: Stack;

      scene.repo.checkoutBranch('a');
      expect(() => validate('UPSTACK', scene.context)).to.throw(Error);
      branch = currentBranchPrecondition(scene.context);
      stack = new MetaStackBuilder().upstackInclusiveFromBranchWithParents(
        branch,
        scene.context
      );
      expect(() => validateStack('UPSTACK', stack, scene.context)).to.throw(
        Error
      );

      scene.repo.checkoutBranch('b');
      expect(() => validate('UPSTACK', scene.context)).to.not.throw(Error);
      branch = currentBranchPrecondition(scene.context);
      stack = new MetaStackBuilder().upstackInclusiveFromBranchWithParents(
        branch,
        scene.context
      );
      expect(() => validateStack('UPSTACK', stack, scene.context)).to.not.throw(
        Error
      );

      scene.repo.checkoutBranch('c');
      expect(() => validate('UPSTACK', scene.context)).to.not.throw(Error);
      branch = currentBranchPrecondition(scene.context);
      stack = new MetaStackBuilder().upstackInclusiveFromBranchWithParents(
        branch,
        scene.context
      );
      expect(() => validateStack('UPSTACK', stack, scene.context)).to.not.throw(
        Error
      );

      scene.repo.checkoutBranch('d');
      expect(() => validate('UPSTACK', scene.context)).to.not.throw(Error);
      branch = currentBranchPrecondition(scene.context);
      stack = new MetaStackBuilder().upstackInclusiveFromBranchWithParents(
        branch,
        scene.context
      );
      expect(() => validateStack('UPSTACK', stack, scene.context)).to.not.throw(
        Error
      );
    });

    it('Can validate downstack', async () => {
      setupScene(scene);
      let branch: Branch;
      let metaStack: Stack;

      scene.repo.checkoutBranch('a');
      expect(() => validate('DOWNSTACK', scene.context)).to.not.throw(Error);
      branch = currentBranchPrecondition(scene.context);
      metaStack = new MetaStackBuilder().downstackFromBranch(
        branch,
        scene.context
      );
      expect(() =>
        validateStack('DOWNSTACK', metaStack, scene.context)
      ).to.not.throw(Error);

      scene.repo.checkoutBranch('b');
      expect(() => validate('DOWNSTACK', scene.context)).to.throw(Error);
      branch = currentBranchPrecondition(scene.context);
      metaStack = new MetaStackBuilder().downstackFromBranch(
        branch,
        scene.context
      );
      expect(() =>
        validateStack('DOWNSTACK', metaStack, scene.context)
      ).to.throw(Error);

      scene.repo.checkoutBranch('c');
      expect(() => validate('DOWNSTACK', scene.context)).to.throw(Error);
      branch = currentBranchPrecondition(scene.context);
      metaStack = new MetaStackBuilder().downstackFromBranch(
        branch,
        scene.context
      );
      expect(() =>
        validateStack('DOWNSTACK', metaStack, scene.context)
      ).to.throw(Error);

      scene.repo.checkoutBranch('d');
      expect(() => validate('DOWNSTACK', scene.context)).to.throw(Error);
      branch = currentBranchPrecondition(scene.context);
      metaStack = new MetaStackBuilder().downstackFromBranch(
        branch,
        scene.context
      );
      expect(() =>
        validateStack('DOWNSTACK', metaStack, scene.context)
      ).to.throw(Error);
    });

    it('Can validate fullstack', async () => {
      let branch: Branch;
      let metaStack: Stack;
      scene.repo.createChange('a');
      scene.repo.execCliCommand(`branch create "a" -m "a" -q`);
      cache.clearAll();
      expect(() => validate('FULLSTACK', scene.context)).to.not.throw(Error);
      branch = currentBranchPrecondition(scene.context);
      metaStack = new MetaStackBuilder().fullStackFromBranch(
        branch,
        scene.context
      );
      expect(() =>
        validateStack('FULLSTACK', metaStack, scene.context)
      ).to.not.throw(Error);

      scene.repo.createChange('b');
      scene.repo.execCliCommand(`branch create "b" -m "b" -q`);
      cache.clearAll();
      expect(() => validate('FULLSTACK', scene.context)).to.not.throw(Error);
      branch = currentBranchPrecondition(scene.context);
      metaStack = new MetaStackBuilder().fullStackFromBranch(
        branch,
        scene.context
      );
      expect(() =>
        validateStack('FULLSTACK', metaStack, scene.context)
      ).to.not.throw(Error);

      scene.repo.createAndCheckoutBranch('c');
      scene.repo.createChangeAndCommit('c');
      cache.clearAll();
      expect(() => validate('FULLSTACK', scene.context)).to.throw(Error);
      branch = currentBranchPrecondition(scene.context);
      metaStack = new MetaStackBuilder().fullStackFromBranch(
        branch,
        scene.context
      );
      expect(() =>
        validateStack('FULLSTACK', metaStack, scene.context)
      ).to.throw(Error);
    });
  });
}
