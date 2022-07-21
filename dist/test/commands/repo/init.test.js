"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const fs_extra_1 = __importDefault(require("fs-extra"));
const trailing_prod_scene_1 = require("../../lib/scenes/trailing_prod_scene");
const configure_test_1 = require("../../lib/utils/configure_test");
for (const scene of [new trailing_prod_scene_1.TrailingProdScene()]) {
    describe(`(${scene}): repo init`, function () {
        (0, configure_test_1.configureTest)(this, scene);
        it('Can run repo init', () => {
            const repoConfigPath = `${scene.repo.dir}/.git/.graphite_repo_config`;
            fs_extra_1.default.removeSync(repoConfigPath);
            scene.repo.execCliCommand('repo init --trunk main');
            const savedConfig = JSON.parse(fs_extra_1.default.readFileSync(repoConfigPath).toString());
            (0, chai_1.expect)(savedConfig['trunk']).to.eq('main');
        });
        it('Falls back to main if non-existent branch is passed in', () => {
            const repoConfigPath = `${scene.repo.dir}/.git/.graphite_repo_config`;
            scene.repo.execCliCommand('repo init --trunk random --no-interactive');
            const savedConfig = JSON.parse(fs_extra_1.default.readFileSync(repoConfigPath).toString());
            (0, chai_1.expect)(savedConfig['trunk']).to.eq('main');
        });
        it('Cannot set an invalid trunk if trunk cannot be inferred', () => {
            scene.repo.execGitCommand('branch -m main2');
            (0, chai_1.expect)(() => scene.repo.execCliCommand('repo init --trunk random --no-interactive')).to.throw(Error);
        });
    });
}
//# sourceMappingURL=init.test.js.map