"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCommitRange = void 0;
const exec_sync_1 = require("../utils/exec_sync");
const FORMAT = { SHA: '%H', READABLE: '%h - %s' };
function getCommitRange(base, head, format) {
    return (0, exec_sync_1.gpExecSyncAndSplitLines)({
        command: `git --no-pager log --pretty=format:"${FORMAT[format]}" ${base}..${head}`,
    });
}
exports.getCommitRange = getCommitRange;
//# sourceMappingURL=commit_range.js.map