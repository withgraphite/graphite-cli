"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const fs_extra_1 = __importDefault(require("fs-extra"));
const scenes_1 = require("../../../lib/scenes");
const utils_1 = require("../../../lib/utils");
for (const scene of [new scenes_1.TrailingProdScene()]) {
    describe(`(${scene}): repo ignored-branches`, function () {
        utils_1.configureTest(this, scene);
        it('Can add to ignored-branches', () => {
            const repoConfigPath = `${scene.repo.dir}/.git/.graphite_repo_config`;
            fs_extra_1.default.removeSync(repoConfigPath);
            scene.repo.execCliCommand('repo init --trunk main');
            const branchToAdd = 'prod';
            scene.repo.execCliCommand(`repo ignored-branches --add ${branchToAdd}`);
            const savedConfig = JSON.parse(fs_extra_1.default.readFileSync(repoConfigPath).toString());
            chai_1.expect(savedConfig['ignoreBranches']).to.contain(branchToAdd);
        });
        it('Can remove from ignored-branches', () => {
            const repoConfigPath = `${scene.repo.dir}/.git/.graphite_repo_config`;
            fs_extra_1.default.removeSync(repoConfigPath);
            scene.repo.execCliCommand('repo init --trunk main');
            const branch = 'prod';
            scene.repo.execCliCommand(`repo ignored-branches --add ${branch}`);
            let savedConfig = JSON.parse(fs_extra_1.default.readFileSync(repoConfigPath).toString());
            chai_1.expect(savedConfig['ignoreBranches']).to.contain(branch);
            scene.repo.execCliCommand(`repo ignored-branches --remove ${branch}`);
            savedConfig = JSON.parse(fs_extra_1.default.readFileSync(repoConfigPath).toString());
            chai_1.expect(savedConfig['ignoreBranches']).to.not.contain(branch);
        });
        it('Can get ignored-branches', () => {
            const repoConfigPath = `${scene.repo.dir}/.git/.graphite_repo_config`;
            fs_extra_1.default.removeSync(repoConfigPath);
            const branchToAdd = 'prod';
            scene.repo.execCliCommand(`repo init --trunk main --ignore-branches ${branchToAdd}`);
            chai_1.expect(scene.repo.execCliCommandAndGetOutput(`repo ignored-branches`)).to.contain(branchToAdd);
            const savedConfig = JSON.parse(fs_extra_1.default.readFileSync(repoConfigPath).toString());
            chai_1.expect(savedConfig['ignoreBranches'][0]).to.eq(branchToAdd);
        });
    });
}
//# sourceMappingURL=ignored_branches.test.js.map