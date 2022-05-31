"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = exports.builder = exports.description = exports.canonical = exports.command = void 0;
const tmp_1 = __importDefault(require("tmp"));
const profile_1 = require("../lib/telemetry/profile");
const exec_sync_1 = require("../lib/utils/exec_sync");
const git_repo_1 = require("../lib/utils/git_repo");
const make_id_1 = require("../lib/utils/make_id");
exports.command = 'demo';
exports.canonical = 'demo';
exports.description = false;
const args = {};
exports.builder = args;
const handler = (argv) => __awaiter(void 0, void 0, void 0, function* () {
    return profile_1.profile(argv, exports.canonical, () => __awaiter(void 0, void 0, void 0, function* () {
        const tmpDir = tmp_1.default.dirSync();
        console.log(tmpDir.name);
        const repo = new git_repo_1.GitRepo(tmpDir.name);
        const id = make_id_1.makeId(4);
        repo.createChangeAndCommit('First commit');
        repo.createChangeAndCommit('Second commit');
        repo.createChange('[Product] Add review queue filter api');
        execCliCommand(`branch create 'tr-${id}--review_queue_api' -m '[Product] Add review queue filter api'`, { fromDir: tmpDir.name });
        repo.createChange('[Product] Add review queue filter server');
        execCliCommand(`branch create 'tr-${id}--review_queue_server' -m '[Product] Add review queue filter server'`, { fromDir: tmpDir.name });
        repo.createChange('[Product] Add review queue filter frontend');
        execCliCommand(`branch create 'tr-${id}--review_queue_frontend' -m '[Product] Add review queue filter frontend'`, { fromDir: tmpDir.name });
        repo.checkoutBranch('main');
        repo.createChange('[Bug Fix] Fix crashes on reload');
        execCliCommand(`branch create 'tr-${id}--fix_crash_on_reload' -m '[Bug Fix] Fix crashes on reload'`, { fromDir: tmpDir.name });
        repo.checkoutBranch('main');
        repo.createChange('[Bug Fix] Account for empty state');
        execCliCommand(`branch create 'tr-${id}--account_for_empty_state' -m '[Bug Fix] Account for empty state'`, { fromDir: tmpDir.name });
        repo.checkoutBranch('main');
        exec_sync_1.gpExecSync({
            command: 'git remote add origin git@github.com:withgraphite/graphite-demo-repo.git',
            options: { cwd: tmpDir.name },
        });
        exec_sync_1.gpExecSync({
            command: 'git push origin main -f',
            options: { cwd: tmpDir.name },
        });
    }));
});
exports.handler = handler;
function execCliCommand(command, opts) {
    exec_sync_1.gpExecSync({
        command: `gt ${command}`,
        options: {
            stdio: 'inherit',
            cwd: opts.fromDir,
        },
    });
}
//# sourceMappingURL=demo.js.map