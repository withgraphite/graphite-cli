"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.showCommits = void 0;
const exec_sync_1 = require("../utils/exec_sync");
function showCommits(base, head, patch) {
    (0, exec_sync_1.gpExecSync)({
        command: `git --no-pager log ${patch ? '-p' : ''} ${base}..${head} --`,
        options: { stdio: 'inherit' },
    });
}
exports.showCommits = showCommits;
//# sourceMappingURL=show_commits.js.map