import { expect } from 'chai';
import fs from 'fs-extra';
import path from 'path';
import { performInTmpDir } from '../../../../src/lib/utils/perform_in_tmp_dir';
import { BasicScene } from '../../../lib/scenes/basic_scene';
import { configureTest } from '../../../lib/utils/configure_test';
import { expectCommits } from '../../../lib/utils/expect_commits';

const EXEC_OUTPUT = 'output.txt';
function createStackEditsInput(opts: {
  dirPath: string;
  orderedBranches: string[];
}): string {
  const contents = opts.orderedBranches
    .map((b) => `exec echo ${b} >> ${opts.dirPath}/${EXEC_OUTPUT}\npick ${b}`)
    .join('\n');
  const filePath = path.join(opts.dirPath, 'edits.txt');
  fs.writeFileSync(filePath, contents);
  return filePath;
}

for (const scene of [new BasicScene()]) {
  describe(`(${scene}): downstack edit`, function () {
    configureTest(this, scene);

    it('Can make a no-op downstack edit without conflict or error', () => {
      scene.repo.createChange('2', 'a');
      scene.repo.execCliCommand("branch create 'a' -m '2' -q");
      scene.repo.createChange('3', 'b');
      scene.repo.execCliCommand("branch create 'b' -m '3' -q");

      performInTmpDir((dirPath) => {
        const inputPath = createStackEditsInput({
          dirPath,
          orderedBranches: ['b', 'a'],
        });
        expect(() =>
          scene.repo.execCliCommand(`downstack edit --input "${inputPath}"`)
        ).to.not.throw(Error);
        expect(scene.repo.rebaseInProgress()).to.be.false;
        expect(
          fs.readFileSync(`${dirPath}/${EXEC_OUTPUT}`).toString().trim()
        ).to.equal(['a', 'b'].join('\n'));
      });
    });

    it('Can can resolve a conflict and continue', () => {
      scene.repo.createChange('2', 'a');
      scene.repo.execCliCommand("branch create 'a' -m '2' -q");
      scene.repo.createChange('3', 'a'); // change the same file with a new value.
      scene.repo.execCliCommand("branch create 'b' -m '3' -q");

      performInTmpDir((dirPath) => {
        const inputPath = createStackEditsInput({
          dirPath,
          orderedBranches: ['a', 'b'], // reverse the order
        });
        expect(() =>
          scene.repo.execCliCommand(`downstack edit --input "${inputPath}"`)
        ).to.not.throw(Error);

        while (scene.repo.rebaseInProgress()) {
          scene.repo.resolveMergeConflicts();
          scene.repo.markMergeConflictsAsResolved();
          scene.repo.execCliCommand('continue');
        }
        expectCommits(scene.repo, '2, 3, 1');
        expect(
          fs.readFileSync(`${dirPath}/${EXEC_OUTPUT}`).toString().trim()
        ).to.equal(['b', 'a'].join('\n'));
      });
    });
  });
}
