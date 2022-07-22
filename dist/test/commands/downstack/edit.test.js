"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const perform_in_tmp_dir_1 = require("../../../src/lib/utils/perform_in_tmp_dir");
const basic_scene_1 = require("../../lib/scenes/basic_scene");
const configure_test_1 = require("../../lib/utils/configure_test");
const expect_commits_1 = require("../../lib/utils/expect_commits");
function createStackEditsInput(opts) {
    const contents = opts.orderedBranches.join('\n');
    const filePath = path_1.default.join(opts.dirPath, 'edits.txt');
    fs_extra_1.default.writeFileSync(filePath, contents);
    return filePath;
}
for (const scene of [new basic_scene_1.BasicScene()]) {
    describe(`(${scene}): downstack edit`, function () {
        (0, configure_test_1.configureTest)(this, scene);
        it('Can make a no-op downstack edit without conflict or error', () => {
            scene.repo.createChange('2', 'a');
            scene.repo.runCliCommand([`branch`, `create`, `a`, `-m`, `2`]);
            scene.repo.createChange('3', 'b');
            scene.repo.runCliCommand([`branch`, `create`, `b`, `-m`, `3`]);
            (0, perform_in_tmp_dir_1.performInTmpDir)((dirPath) => {
                const inputPath = createStackEditsInput({
                    dirPath,
                    orderedBranches: ['b', 'a'],
                });
                (0, chai_1.expect)(() => scene.repo.runCliCommand([`downstack`, `edit`, `--input`, inputPath])).to.not.throw(Error);
                (0, chai_1.expect)(scene.repo.rebaseInProgress()).to.be.false;
            });
        });
        it('Can can resolve a conflict and continue', () => {
            scene.repo.createChange('2', 'a');
            scene.repo.runCliCommand([`branch`, `create`, `a`, `-m`, `2`]);
            scene.repo.createChange('3', 'a'); // change the same file with a new value.
            scene.repo.runCliCommand([`branch`, `create`, `b`, `-m`, `3`]);
            (0, perform_in_tmp_dir_1.performInTmpDir)((dirPath) => {
                const inputPath = createStackEditsInput({
                    dirPath,
                    orderedBranches: ['a', 'b'], // reverse the order
                });
                (0, chai_1.expect)(() => scene.repo.runCliCommand([`downstack`, `edit`, `--input`, inputPath])).to.throw(Error);
                (0, chai_1.expect)(scene.repo.rebaseInProgress()).to.be.true;
                scene.repo.resolveMergeConflicts();
                scene.repo.markMergeConflictsAsResolved();
                (0, chai_1.expect)(() => scene.repo.runCliCommand(['continue'])).to.throw();
                (0, chai_1.expect)(scene.repo.rebaseInProgress()).to.eq(true);
                scene.repo.resolveMergeConflicts();
                scene.repo.markMergeConflictsAsResolved();
                scene.repo.runCliCommand(['continue']);
                (0, expect_commits_1.expectCommits)(scene.repo, '2, 3, 1');
            });
        });
    });
}
//# sourceMappingURL=edit.test.js.map