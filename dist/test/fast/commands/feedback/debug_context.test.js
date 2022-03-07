"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const fs_extra_1 = __importDefault(require("fs-extra"));
const git_repo_1 = require("../../../../src/lib/utils/git_repo");
const scenes_1 = require("../../../lib/scenes");
const utils_1 = require("../../../lib/utils");
for (const scene of [new scenes_1.TrailingProdScene()]) {
    describe(`(${scene}): feedback debug-context`, function () {
        utils_1.configureTest(this, scene);
        it('Can create debug-context', () => {
            chai_1.expect(() => scene.repo.execCliCommand(`feedback debug-context`)).to.not.throw(Error);
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
            chai_1.expect(newRepo.currentBranchName()).to.eq('b');
            newRepo.execCliCommand(`bp`);
            chai_1.expect(newRepo.currentBranchName()).to.eq('a');
            fs_extra_1.default.emptyDirSync(tmpDir);
            fs_extra_1.default.removeSync(tmpDir);
        });
    });
}
//# sourceMappingURL=debug_context.test.js.map