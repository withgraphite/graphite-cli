"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AbstractScene = void 0;
const child_process_1 = require("child_process");
const fs_extra_1 = __importDefault(require("fs-extra"));
const tmp_1 = __importDefault(require("tmp"));
const context_1 = require("../../../src/lib/context/context");
const git_repo_1 = require("../../../src/lib/utils/git_repo");
class AbstractScene {
    constructor() {
        this.oldDir = child_process_1.execSync('pwd').toString().trim();
        this.tmpDir = tmp_1.default.dirSync();
        this.dir = this.tmpDir.name;
        this.repo = new git_repo_1.GitRepo(this.dir);
        fs_extra_1.default.writeFileSync(`${this.dir}/.git/.graphite_repo_config`, JSON.stringify({ trunk: 'main' }, null, 2));
        process.chdir(this.dir);
        this.context = context_1.initContext();
    }
    setup() {
        this.tmpDir = tmp_1.default.dirSync();
        this.dir = this.tmpDir.name;
        this.repo = new git_repo_1.GitRepo(this.dir);
        fs_extra_1.default.writeFileSync(`${this.dir}/.git/.graphite_repo_config`, JSON.stringify({ trunk: 'main' }, null, 2));
        process.chdir(this.dir);
        this.context = context_1.initContext();
    }
    cleanup() {
        process.chdir(this.oldDir);
        if (!process.env.DEBUG) {
            fs_extra_1.default.emptyDirSync(this.dir);
            this.tmpDir.removeCallback();
        }
    }
}
exports.AbstractScene = AbstractScene;
//# sourceMappingURL=abstract_scene.js.map