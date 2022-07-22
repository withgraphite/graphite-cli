"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.rebaseInProgress = void 0;
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const run_command_1 = require("../utils/run_command");
function rebaseInProgress(options) {
    let rebaseDir = path_1.default.join((0, run_command_1.runGitCommand)({
        args: [`rev-parse`, `--git-dir`],
        options,
        onError: 'throw',
        resource: 'rebaseInProgress',
    }), 'rebase-merge');
    if (options?.cwd) {
        rebaseDir = path_1.default.join(options.cwd, rebaseDir);
    }
    return fs_extra_1.default.existsSync(rebaseDir);
}
exports.rebaseInProgress = rebaseInProgress;
//# sourceMappingURL=rebase_in_progress.js.map