"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCommitMessage = void 0;
const exec_sync_1 = require("../utils/exec_sync");
const GIT_LOG_FORMAT = {
    BODY: '%b',
    SUBJECT: '%s',
};
function getCommitMessage(sha, format) {
    return (0, exec_sync_1.gpExecSync)({
        command: `git --no-pager log --format=${GIT_LOG_FORMAT[format]} -n 1 ${sha} --`,
    });
}
exports.getCommitMessage = getCommitMessage;
//# sourceMappingURL=commit_message.js.map