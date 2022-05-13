"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const perform_in_tmp_dir_1 = require("../../../../src/lib/utils/perform_in_tmp_dir");
const basic_scene_1 = require("../../../lib/scenes/basic_scene");
const configure_test_1 = require("../../../lib/utils/configure_test");
const expect_commits_1 = require("../../../lib/utils/expect_commits");
const EXEC_OUTPUT = 'output.txt';
function createStackEditsInput(opts) {
    const contents = opts.orderedBranches
        .map((b) => `exec echo ${b} >> ${opts.dirPath}/${EXEC_OUTPUT}\npick ${b}`)
        .join('\n');
    const filePath = path_1.default.join(opts.dirPath, 'edits.txt');
    fs_extra_1.default.writeFileSync(filePath, contents);
    return filePath;
}
for (const scene of [new basic_scene_1.BasicScene()]) {
    describe(`(${scene}): downstack edit`, function () {
        configure_test_1.configureTest(this, scene);
        it('Can make a no-op downstack edit without conflict or error', () => {
            scene.repo.createChange('2', 'a');
            scene.repo.execCliCommand("branch create 'a' -m '2' -q");
            scene.repo.createChange('3', 'b');
            scene.repo.execCliCommand("branch create 'b' -m '3' -q");
            perform_in_tmp_dir_1.performInTmpDir((dirPath) => {
                const inputPath = createStackEditsInput({
                    dirPath,
                    orderedBranches: ['b', 'a'],
                });
                chai_1.expect(() => scene.repo.execCliCommand(`downstack edit --input "${inputPath}"`)).to.not.throw(Error);
                chai_1.expect(scene.repo.rebaseInProgress()).to.be.false;
                chai_1.expect(fs_extra_1.default.readFileSync(`${dirPath}/${EXEC_OUTPUT}`).toString().trim()).to.equal(['a', 'b'].join('\n'));
            });
        });
        it('Can can resolve a conflict and continue', () => {
            scene.repo.createChange('2', 'a');
            scene.repo.execCliCommand("branch create 'a' -m '2' -q");
            scene.repo.createChange('3', 'a'); // change the same file with a new value.
            scene.repo.execCliCommand("branch create 'b' -m '3' -q");
            perform_in_tmp_dir_1.performInTmpDir((dirPath) => {
                const inputPath = createStackEditsInput({
                    dirPath,
                    orderedBranches: ['a', 'b'], // reverse the order
                });
                chai_1.expect(() => scene.repo.execCliCommand(`downstack edit --input "${inputPath}"`)).to.not.throw(Error);
                while (scene.repo.rebaseInProgress()) {
                    scene.repo.resolveMergeConflicts();
                    scene.repo.markMergeConflictsAsResolved();
                    scene.repo.execCliCommand('continue --no-edit');
                }
                expect_commits_1.expectCommits(scene.repo, '2, 3, 1');
                chai_1.expect(fs_extra_1.default.readFileSync(`${dirPath}/${EXEC_OUTPUT}`).toString().trim()).to.equal(['b', 'a'].join('\n'));
            });
        });
    });
}
//# sourceMappingURL=edit.test.js.map