"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.printConflictStatus = void 0;
const chalk_1 = __importDefault(require("chalk"));
const merge_conflict_help_1 = require("../lib/git/merge_conflict_help");
const log_1 = require("./log");
function printConflictStatus(errMessage, context) {
    context.splog.info(chalk_1.default.redBright(errMessage));
    context.splog.newline();
    context.splog.info(chalk_1.default.yellow(`Unmerged files:`));
    context.splog.info((0, merge_conflict_help_1.getUnmergedFiles)()
        .map((line) => chalk_1.default.redBright(line))
        .join('\n'));
    context.splog.newline();
    const rebaseHead = (0, merge_conflict_help_1.getRebaseHead)();
    // this should never be undefined in this case, but we don't need to fail here
    if (rebaseHead) {
        context.splog.info(chalk_1.default.yellow(`You are here (resolving ${chalk_1.default.blueBright(rebaseHead)}):`));
        (0, log_1.logForConflictStatus)(rebaseHead, context);
        context.splog.newline();
    }
    context.splog.info(chalk_1.default.yellow(`To fix and continue your previous Graphite command:`));
    context.splog.info(`(1) resolve the listed merge conflicts`);
    context.splog.info(`(2) mark them as resolved with ${chalk_1.default.cyan(`gt add`)}`);
    context.splog.info(`(3) run ${chalk_1.default.cyan(`gt continue`)} to continue executing your previous Graphite command`);
    context.splog.tip("It's safe to cancel the ongoing rebase with `gt rebase --abort`.");
}
exports.printConflictStatus = printConflictStatus;
//# sourceMappingURL=print_conflict_status.js.map