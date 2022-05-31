"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.composeSplog = void 0;
const chalk_1 = __importDefault(require("chalk"));
function composeSplog(opts) {
    return {
        logNewline: opts.quiet ? () => void 0 : () => console.log('\n'),
        logInfo: opts.quiet ? () => void 0 : (s) => console.log(s),
        logDebug: opts.outputDebugLogs
            ? (s) => console.log(`DEBUG: ${s}`)
            : () => void 0,
        logError: (s) => console.log(chalk_1.default.redBright(`ERROR: ${s}`)),
        logWarn: (s) => console.log(chalk_1.default.yellow(`WARNING: ${s}`)),
        logMessageFromGraphite: (s) => console.log(chalk_1.default.yellow(`${chalk_1.default.yellow(s)}\n\n`)),
        logTip: (s) => opts.tips && !opts.quiet
            ? console.log(chalk_1.default.gray([
                '',
                `${chalk_1.default.bold('tip')}: ${s}`,
                chalk_1.default.italic('Feeling expert? "gt user tips --disable"'),
            ].join('\n')))
            : () => void 0,
    };
}
exports.composeSplog = composeSplog;
//# sourceMappingURL=splog.js.map