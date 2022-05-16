"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const repo_config_1 = require("../../../../src/lib/config/repo_config");
const basic_scene_1 = require("../../../lib/scenes/basic_scene");
const configure_test_1 = require("../../../lib/utils/configure_test");
for (const scene of [new basic_scene_1.BasicScene()]) {
    describe(`(${scene}): infer repo owner/name`, function () {
        configure_test_1.configureTest(this, scene);
        it('Can infer cloned repos', () => {
            const { owner, name } = repo_config_1.getOwnerAndNameFromURL('https://github.com/withgraphite/graphite-cli.git');
            chai_1.expect(owner === 'withgraphite').to.be.true;
            chai_1.expect(name === 'graphite-cli').to.be.true;
        });
        it('Can infer SSH cloned repos', () => {
            const { owner, name } = repo_config_1.getOwnerAndNameFromURL('git@github.com:withgraphite/graphite-cli.git');
            chai_1.expect(owner === 'withgraphite').to.be.true;
            chai_1.expect(name === 'graphite-cli').to.be.true;
        });
        it('Can infer SSH cloned repos (with git@ configured separately)', () => {
            const { owner, name } = repo_config_1.getOwnerAndNameFromURL('github.com/withgraphite/graphite-cli.git');
            chai_1.expect(owner === 'withgraphite').to.be.true;
            chai_1.expect(name === 'graphite-cli').to.be.true;
        });
        it('Can read the existing repo config when executing from a subfolder in the project', () => {
            chai_1.expect(() => scene.repo.execCliCommand(`ls`)).to.not.throw(Error);
            const subDir = path_1.default.join(scene.dir, 'tmpDir');
            fs_extra_1.default.mkdirSync(subDir);
            chai_1.expect(() => scene.repo.execCliCommand(`ls`, { cwd: subDir })).to.not.throw(Error);
        });
        // Not sure where these are coming from but we should be able to handle
        // them.
        it('Can infer cloned repos without .git', () => {
            const clone = repo_config_1.getOwnerAndNameFromURL('https://github.com/withgraphite/graphite-cli');
            chai_1.expect(clone.owner === 'withgraphite').to.be.true;
            chai_1.expect(clone.name === 'graphite-cli').to.be.true;
            const sshClone = repo_config_1.getOwnerAndNameFromURL('git@github.com:withgraphite/graphite-cli');
            chai_1.expect(sshClone.owner === 'withgraphite').to.be.true;
            chai_1.expect(sshClone.name === 'graphite-cli').to.be.true;
        });
    });
}
//# sourceMappingURL=repo_config.test.js.map