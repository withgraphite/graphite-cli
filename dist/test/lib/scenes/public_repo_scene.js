"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PublicRepoScene = void 0;
const child_process_1 = require("child_process");
const fs_extra_1 = __importDefault(require("fs-extra"));
const tmp_1 = __importDefault(require("tmp"));
const cute_string_1 = require("../../../src/lib/utils/cute_string");
const git_repo_1 = require("../../../src/lib/utils/git_repo");
const abstract_scene_1 = require("./abstract_scene");
class PublicRepoScene extends abstract_scene_1.AbstractScene {
    repoUrl;
    name;
    timeout;
    constructor(opts) {
        super();
        this.repoUrl = opts.repoUrl;
        this.name = opts.name;
        this.timeout = opts.timeout;
    }
    toString() {
        return this.name;
    }
    setup() {
        this.tmpDir = tmp_1.default.dirSync();
        this.dir = this.tmpDir.name;
        this.repo = new git_repo_1.GitRepo(this.dir, { repoUrl: this.repoUrl });
        (0, child_process_1.execSync)(`git -C ${this.dir} fetch --all`);
        fs_extra_1.default.writeFileSync(`${this.dir}/.git/.graphite_repo_config`, (0, cute_string_1.cuteString)({ trunk: 'master' }));
        process.chdir(this.dir);
        this.repo.createChangeAndCommit('1', '1');
    }
}
exports.PublicRepoScene = PublicRepoScene;
//# sourceMappingURL=public_repo_scene.js.map