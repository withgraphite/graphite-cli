"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRebaseHead = exports.getUnmergedFiles = void 0;
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const run_command_1 = require("../utils/run_command");
function getUnmergedFiles() {
    return (0, run_command_1.runGitCommandAndSplitLines)({
        args: [
            `--no-pager`,
            `diff`,
            `--no-ext-diff`,
            `--name-only`,
            `--diff-filter=U`,
        ],
        onError: 'throw',
        resource: 'getUnmergedFiles',
    });
}
exports.getUnmergedFiles = getUnmergedFiles;
function getRebaseHead() {
    const gitDir = (0, run_command_1.runGitCommand)({
        args: [`rev-parse`, `--git-dir`],
        onError: 'throw',
        resource: 'getRebaseHead',
    });
    const rebaseHeadPath = path_1.default.join(`${gitDir}`, `rebase-merge`, `head-name`);
    return fs_extra_1.default.existsSync(rebaseHeadPath)
        ? fs_extra_1.default
            .readFileSync(rebaseHeadPath, {
            encoding: 'utf-8',
        })
            .trim()
            .slice('refs/heads/'.length)
        : undefined;
}
exports.getRebaseHead = getRebaseHead;
//# sourceMappingURL=merge_conflict_help.js.map