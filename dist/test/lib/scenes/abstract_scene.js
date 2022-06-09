"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AbstractScene = void 0;
const fs_extra_1 = __importDefault(require("fs-extra"));
const tmp_1 = __importDefault(require("tmp"));
const context_1 = require("../../../src/lib/context");
const cute_string_1 = require("../../../src/lib/utils/cute_string");
const git_repo_1 = require("../../../src/lib/utils/git_repo");
class AbstractScene {
    tmpDir;
    repo;
    dir;
    oldDir;
    constructor() {
        this.tmpDir = tmp_1.default.dirSync();
        this.dir = this.tmpDir.name;
        this.repo = new git_repo_1.GitRepo(this.dir);
        this.oldDir = process.cwd();
    }
    setup() {
        this.tmpDir = tmp_1.default.dirSync();
        this.dir = this.tmpDir.name;
        this.repo = new git_repo_1.GitRepo(this.dir);
        fs_extra_1.default.writeFileSync(`${this.dir}/.git/.graphite_repo_config`, (0, cute_string_1.cuteString)({ trunk: 'main' }));
        const userConfigPath = `${this.dir}/.git/.graphite_user_config`;
        fs_extra_1.default.writeFileSync(userConfigPath, (0, cute_string_1.cuteString)({ tips: false }));
        process.env.GRAPHITE_USER_CONFIG_PATH = userConfigPath;
        this.oldDir = process.cwd();
        process.chdir(this.dir);
    }
    cleanup() {
        process.chdir(this.oldDir);
        if (!process.env.DEBUG) {
            fs_extra_1.default.emptyDirSync(this.dir);
            this.tmpDir.removeCallback();
        }
    }
    getContext() {
        const oldDir = process.cwd();
        process.chdir(this.tmpDir.name);
        const context = (0, context_1.initContext)((0, context_1.initContextLite)({
            interactive: false,
            quiet: !!process.env.DEBUG,
            debug: !!process.env.DEBUG,
        }), {
            verify: false,
        });
        process.chdir(oldDir);
        return context;
    }
}
exports.AbstractScene = AbstractScene;
//# sourceMappingURL=abstract_scene.js.map