"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.rebaseInProgress = void 0;
const child_process_1 = require("child_process");
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
function rebaseInProgress(opts) {
    let rebaseDir = path_1.default.join(child_process_1.execSync(`git ${opts ? `-C "${opts.dir}"` : ""} rev-parse --git-dir`)
        .toString()
        .trim(), "rebase-merge");
    if (opts) {
        rebaseDir = path_1.default.join(opts.dir, rebaseDir);
    }
    return fs_extra_1.default.existsSync(rebaseDir);
}
exports.rebaseInProgress = rebaseInProgress;
//# sourceMappingURL=rebase_in_progress.js.map