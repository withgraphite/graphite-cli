"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRepoRootPath = void 0;
const errors_1 = require("../errors");
const exec_sync_1 = require("../utils/exec_sync");
const cache_1 = require("./cache");
function getRepoRootPath() {
    const cachedRepoRootPath = cache_1.cache.getRepoRootPath();
    if (cachedRepoRootPath) {
        return cachedRepoRootPath;
    }
    const repoRootPath = exec_sync_1.gpExecSync({
        command: `git rev-parse --git-dir`,
    }, () => {
        return Buffer.alloc(0);
    })
        .toString()
        .trim();
    if (!repoRootPath || repoRootPath.length === 0) {
        throw new errors_1.PreconditionsFailedError('No .git repository found.');
    }
    cache_1.cache.setRepoRootPath(repoRootPath);
    return repoRootPath;
}
exports.getRepoRootPath = getRepoRootPath;
//# sourceMappingURL=repo_root_path.js.map