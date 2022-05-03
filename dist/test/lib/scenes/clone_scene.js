"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CloneScene = void 0;
const fs_extra_1 = __importDefault(require("fs-extra"));
const tmp_1 = __importDefault(require("tmp"));
const context_1 = require("../../../src/lib/context/context");
const git_repo_1 = require("../../../src/lib/utils/git_repo");
const abstract_scene_1 = require("./abstract_scene");
class CloneScene extends abstract_scene_1.AbstractScene {
    toString() {
        return 'CloneScene';
    }
    setup() {
        super.setup();
        this.repo.createChangeAndCommit('1', '1');
        [this.originDir, this.originRepo, this.originTmpDir] = [
            this.dir,
            this.repo,
            this.tmpDir,
        ];
        this.dir = tmp_1.default.dirSync().name;
        this.repo = new git_repo_1.GitRepo(this.dir, { repoUrl: this.originDir });
        fs_extra_1.default.writeFileSync(`${this.dir}/.git/.graphite_repo_config`, JSON.stringify({ trunk: 'main' }, null, 2));
        fs_extra_1.default.writeFileSync(`${this.dir}/.git/.graphite_user_config`, JSON.stringify({ multiplayerEnabled: true }, null, 2));
        process.chdir(this.dir);
        this.context = context_1.initContext(`${this.dir}/.git/.graphite_user_config`);
    }
    cleanup() {
        process.chdir(this.oldDir);
        if (!process.env.DEBUG) {
            fs_extra_1.default.emptyDirSync(this.originDir);
            fs_extra_1.default.emptyDirSync(this.dir);
            this.tmpDir.removeCallback();
            this.originTmpDir.removeCallback();
        }
    }
}
exports.CloneScene = CloneScene;
//# sourceMappingURL=clone_scene.js.map