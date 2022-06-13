"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCommitterDate = void 0;
const errors_1 = require("../errors");
const exec_sync_1 = require("../utils/exec_sync");
function getCommitterDate(args) {
    const logFormat = {
        UNIX_TIMESTAMP: '%ct',
        RELATIVE_READABLE: '%cr',
    }[args.timeFormat];
    return (0, exec_sync_1.gpExecSync)({
        command: `git --no-pager log -1 --format=${logFormat} -n 1 ${args.revision} --`,
    }, (err) => {
        throw new errors_1.ExitFailedError(`Could not find commit for revision ${args.revision}.`, err);
    });
}
exports.getCommitterDate = getCommitterDate;
//# sourceMappingURL=committer_date.js.map