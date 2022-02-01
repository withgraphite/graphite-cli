"use strict";
exports.__esModule = true;
exports.rebaseInProgress = void 0;
var child_process_1 = require("child_process");
var fs_extra_1 = require("fs-extra");
var path_1 = require("path");
function rebaseInProgress(opts) {
    var rebaseDir = path_1["default"].join(child_process_1.execSync("git " + (opts ? "-C \"" + opts.dir + "\"" : '') + " rev-parse --git-dir")
        .toString()
        .trim(), 'rebase-merge');
    if (opts) {
        rebaseDir = path_1["default"].join(opts.dir, rebaseDir);
    }
    return fs_extra_1["default"].existsSync(rebaseDir);
}
exports.rebaseInProgress = rebaseInProgress;
