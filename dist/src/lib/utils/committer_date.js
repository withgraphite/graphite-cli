"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCommitterDate = void 0;
const errors_1 = require("../errors");
const utils_1 = require("../utils");
function getCommitterDate(args) {
    let logFormat;
    switch (args.timeFormat) {
        case "UNIX_TIMESTAMP":
            logFormat = "%ct";
            break;
        case "RELATIVE_READABLE":
            logFormat = "%cr";
            break;
        default:
            assertUnreachable(args.timeFormat);
    }
    return utils_1.gpExecSync({
        command: `git log -1 --format=${logFormat} -n 1 ${args.revision}`,
    }, (err) => {
        throw new errors_1.ExitFailedError(`Could not find commit for revision ${args.revision}.`, err);
    })
        .toString()
        .trim();
}
exports.getCommitterDate = getCommitterDate;
// eslint-disable-next-line @typescript-eslint/no-empty-function
function assertUnreachable(arg) { }
//# sourceMappingURL=committer_date.js.map