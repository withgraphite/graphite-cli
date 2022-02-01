"use strict";
exports.__esModule = true;
exports.getCommitterDate = void 0;
var errors_1 = require("../errors");
var utils_1 = require("../utils");
function getCommitterDate(args) {
    var logFormat;
    switch (args.timeFormat) {
        case 'UNIX_TIMESTAMP':
            logFormat = '%ct';
            break;
        case 'RELATIVE_READABLE':
            logFormat = '%cr';
            break;
        default:
            assertUnreachable(args.timeFormat);
    }
    return utils_1.gpExecSync({
        command: "git log -1 --format=" + logFormat + " -n 1 " + args.revision + " --"
    }, function (err) {
        throw new errors_1.ExitFailedError("Could not find commit for revision " + args.revision + ".", err);
    })
        .toString()
        .trim();
}
exports.getCommitterDate = getCommitterDate;
// eslint-disable-next-line @typescript-eslint/no-empty-function
function assertUnreachable(arg) { }
