"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pushBranch = void 0;
const exec_sync_1 = require("../utils/exec_sync");
function pushBranch(opts) {
    (0, exec_sync_1.gpExecSync)({
        command: [
            `git push ${opts.remote}`,
            `--force-with-lease ${opts.branchName} 2>&1`,
            ...[opts.noVerify ? ['--no-verify'] : []],
        ].join(' '),
    }, (err) => {
        throw err;
    });
}
exports.pushBranch = pushBranch;
//# sourceMappingURL=push_branch.js.map