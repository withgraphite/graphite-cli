"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const fs_extra_1 = __importDefault(require("fs-extra"));
const git_repo_1 = require("../../../src/lib/utils/git_repo");
const trailing_prod_scene_1 = require("../../lib/scenes/trailing_prod_scene");
const configure_test_1 = require("../../lib/utils/configure_test");
for (const scene of [new trailing_prod_scene_1.TrailingProdScene()]) {
    describe(`(${scene}): feedback debug-context`, function () {
        (0, configure_test_1.configureTest)(this, scene);
        it('Can create debug-context', () => {
            (0, chai_1.expect)(() => scene.repo.execCliCommand(`feedback debug-context`)).to.not.throw(Error);
        });
        it('Can recreate a tmp repo based on debug context', () => {
            scene.repo.createChange('a', 'a');
            scene.repo.execCliCommand(`branch create a -m "a"`);
            scene.repo.createChange('b', 'b');
            scene.repo.execCliCommand(`branch create b -m "b"`);
            const context = scene.repo.execCliCommandAndGetOutput(`feedback debug-context`);
            const outputLines = scene.repo
                .execCliCommandAndGetOutput(`feedback debug-context --recreate '${context}'`)
                .toString()
                .trim()
                .split('\n');
            const tmpDir = outputLines[outputLines.length - 1];
            const newRepo = new git_repo_1.GitRepo(tmpDir);
            newRepo.checkoutBranch('b');
            (0, chai_1.expect)(newRepo.currentBranchName()).to.eq('b');
            newRepo.execCliCommand(`bd`);
            (0, chai_1.expect)(newRepo.currentBranchName()).to.eq('a');
            fs_extra_1.default.emptyDirSync(tmpDir);
            fs_extra_1.default.removeSync(tmpDir);
        });
    });
}
//# sourceMappingURL=debug_context.test.js.map