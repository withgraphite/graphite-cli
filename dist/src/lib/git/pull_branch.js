"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pullBranch = void 0;
const exec_sync_1 = require("../utils/exec_sync");
function pullBranch(remote, branchName) {
    (0, exec_sync_1.gpExecSync)({ command: `git pull -q --ff-only ${remote} ${branchName}` }, (err) => {
        throw err;
    });
}
exports.pullBranch = pullBranch;
//# sourceMappingURL=pull_branch.js.map