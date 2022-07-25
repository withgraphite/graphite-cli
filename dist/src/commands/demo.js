"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = exports.builder = exports.description = exports.canonical = exports.command = void 0;
const tmp_1 = __importDefault(require("tmp"));
const runner_1 = require("../lib/runner");
const git_repo_1 = require("../lib/utils/git_repo");
const make_id_1 = require("../lib/utils/make_id");
const run_command_1 = require("../lib/utils/run_command");
exports.command = 'demo';
exports.canonical = 'demo';
exports.description = false;
const args = {};
exports.builder = args;
const handler = async (argv) => {
    return (0, runner_1.graphiteWithoutRepo)(argv, exports.canonical, async (context) => {
        const tmpDir = tmp_1.default.dirSync();
        context.splog.info(tmpDir.name);
        const repo = new git_repo_1.GitRepo(tmpDir.name);
        const id = (0, make_id_1.makeId)(4);
        repo.createChangeAndCommit('First commit');
        repo.createChangeAndCommit('Second commit');
        repo.createChange('[Product] Add review queue filter api');
        runCliCommand([
            'branch',
            'create',
            `tr-${id}--review_queue_api`,
            '-m',
            '[Product] Add review queue filter api',
        ], tmpDir.name);
        repo.createChange('[Product] Add review queue filter server');
        runCliCommand([
            'branch',
            'create',
            `tr-${id}--review_queue_server`,
            '-m',
            '[Product] Add review queue filter server',
        ], tmpDir.name);
        repo.createChange('[Product] Add review queue filter frontend');
        runCliCommand([
            'branch',
            'create',
            `tr-${id}--review_queue_frontend`,
            '-m',
            '[Product] Add review queue filter frontend',
        ], tmpDir.name);
        repo.checkoutBranch('main');
        repo.createChange('[Bug Fix] Fix crashes on reload');
        runCliCommand([
            'branch',
            'create',
            `tr-${id}--fix_crash_on_reload`,
            '-m',
            '[Bug Fix] Fix crashes on reload',
        ], tmpDir.name);
        repo.checkoutBranch('main');
        repo.createChange('[Bug Fix] Account for empty state');
        runCliCommand([
            'branch',
            'create',
            `tr-${id}--account_for_empty_state`,
            '-m',
            '[Bug Fix] Account for empty state',
        ], tmpDir.name);
        repo.checkoutBranch('main');
        (0, run_command_1.runGitCommand)({
            args: [
                'remote',
                'add',
                'origin',
                'git@github.com:withgraphite/graphite-demo-repo.git',
            ],
            options: { cwd: tmpDir.name },
            onError: 'throw',
            resource: null, // no tracing from demo
        });
        (0, run_command_1.runGitCommand)({
            args: ['push', 'origin', 'main', '-f'],
            options: { cwd: tmpDir.name },
            onError: 'throw',
            resource: null, // no tracing from demo
        });
    });
};
exports.handler = handler;
function runCliCommand(args, fromDir) {
    (0, run_command_1.runCommand)({
        command: 'gt',
        args,
        options: {
            stdio: 'inherit',
            cwd: fromDir,
        },
        onError: 'throw',
    });
}
//# sourceMappingURL=demo.js.map