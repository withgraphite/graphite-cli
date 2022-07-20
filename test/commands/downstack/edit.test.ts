import { expect } from 'chai';
import fs from 'fs-extra';
import path from 'path';
import { performInTmpDir } from '../../../src/lib/utils/perform_in_tmp_dir';
import { BasicScene } from '../../lib/scenes/basic_scene';
import { configureTest } from '../../lib/utils/configure_test';
import { expectCommits } from '../../lib/utils/expect_commits';

function createStackEditsInput(opts: {
  dirPath: string;
  orderedBranches: string[];
}): string {
  const contents = opts.orderedBranches.join('\n');
  const filePath = path.join(opts.dirPath, 'edits.txt');
  fs.writeFileSync(filePath, contents);
  return filePath;
}

for (const scene of [new BasicScene()]) {
  describe(`(${scene}): downstack edit`, function () {
    configureTest(this, scene);

    it('Can make a no-op downstack edit without conflict or error', () => {
      scene.repo.createChange('2', 'a');
      scene.repo.runCliCommand([`branch`, `create`, `a`, `-m`, `2`]);
      scene.repo.createChange('3', 'b');
      scene.repo.runCliCommand([`branch`, `create`, `b`, `-m`, `3`]);

      performInTmpDir((dirPath) => {
        const inputPath = createStackEditsInput({
          dirPath,
          orderedBranches: ['b', 'a'],
        });
        expect(() =>
          scene.repo.runCliCommand([`downstack`, `edit`, `--input`, inputPath])
        ).to.not.throw(Error);
        expect(scene.repo.rebaseInProgress()).to.be.false;
      });
    });

    it('Can can resolve a conflict and continue', () => {
      scene.repo.createChange('2', 'a');
      scene.repo.runCliCommand([`branch`, `create`, `a`, `-m`, `2`]);
      scene.repo.createChange('3', 'a'); // change the same file with a new value.
      scene.repo.runCliCommand([`branch`, `create`, `b`, `-m`, `3`]);

      performInTmpDir((dirPath) => {
        const inputPath = createStackEditsInput({
          dirPath,
          orderedBranches: ['a', 'b'], // reverse the order
        });
        expect(() =>
          scene.repo.runCliCommand([`downstack`, `edit`, `--input`, inputPath])
        ).to.throw(Error);
        expect(scene.repo.rebaseInProgress()).to.be.true;

        scene.repo.resolveMergeConflicts();
        scene.repo.markMergeConflictsAsResolved();

        expect(() => scene.repo.runCliCommand(['continue'])).to.throw();
        expect(scene.repo.rebaseInProgress()).to.eq(true);

        scene.repo.resolveMergeConflicts();
        scene.repo.markMergeConflictsAsResolved();
        scene.repo.runCliCommand(['continue']);
        expectCommits(scene.repo, '2, 3, 1');
      });
    });
  });
}
