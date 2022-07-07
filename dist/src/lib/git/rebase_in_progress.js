"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.rebaseInProgress = void 0;
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const exec_sync_1 = require("../utils/exec_sync");
function rebaseInProgress(opts) {
    let rebaseDir = path_1.default.join((0, exec_sync_1.gpExecSync)({
        command: `git ${opts ? `-C "${opts.dir}"` : ''} rev-parse --git-dir`,
    }), 'rebase-merge');
    if (opts) {
        rebaseDir = path_1.default.join(opts.dir, rebaseDir);
    }
    return fs_extra_1.default.existsSync(rebaseDir);
}
exports.rebaseInProgress = rebaseInProgress;
//# sourceMappingURL=rebase_in_progress.js.map