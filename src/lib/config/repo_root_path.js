"use strict";
exports.__esModule = true;
exports.getRepoRootPath = void 0;
var errors_1 = require("../errors");
var exec_sync_1 = require("../utils/exec_sync");
var cache_1 = require("./cache");
function getRepoRootPath() {
    var cachedRepoRootPath = cache_1["default"].getRepoRootPath();
    if (cachedRepoRootPath) {
        return cachedRepoRootPath;
    }
    var repoRootPath = exec_sync_1.gpExecSync({
        command: "git rev-parse --git-dir"
    }, function () {
        return Buffer.alloc(0);
    })
        .toString()
        .trim();
    if (!repoRootPath || repoRootPath.length === 0) {
        throw new errors_1.PreconditionsFailedError('No .git repository found.');
    }
    cache_1["default"].setRepoRootPath(repoRootPath);
    return repoRootPath;
}
exports.getRepoRootPath = getRepoRootPath;
