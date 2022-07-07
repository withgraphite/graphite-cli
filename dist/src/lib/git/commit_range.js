"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCommitRange = void 0;
const escape_for_shell_1 = require("../utils/escape_for_shell");
const exec_sync_1 = require("../utils/exec_sync");
const FORMAT = {
    READABLE: '%h - %s',
    SUBJECT: '%s',
    MESSAGE: '## %B%n',
    COMMITTER_DATE: '%cr',
    SHA: '%H',
};
function getCommitRange(base, head, format) {
    return (0, exec_sync_1.gpExecSyncAndSplitLines)({
        command: `git --no-pager log --pretty=format:"%H" ${(0, escape_for_shell_1.q)(base)}..${(0, escape_for_shell_1.q)(head)}`,
    }).map((sha) => (0, exec_sync_1.gpExecSync)({
        command: `git --no-pager log -1 --pretty=format:"${FORMAT[format]}" ${(0, escape_for_shell_1.q)(sha)}`,
    }));
}
exports.getCommitRange = getCommitRange;
//# sourceMappingURL=commit_range.js.map