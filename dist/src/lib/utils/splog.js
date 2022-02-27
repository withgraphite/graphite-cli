"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logNewline = exports.logTip = exports.logDebug = exports.logSuccess = exports.logInfo = exports.logWarn = exports.logError = exports.logMessageFromGraphite = void 0;
const chalk_1 = __importDefault(require("chalk"));
const config_1 = require("../config");
function logMessageFromGraphite(msg) {
    console.log(chalk_1.default.yellow(msg) + '\n\n');
}
exports.logMessageFromGraphite = logMessageFromGraphite;
function logError(msg) {
    console.log(chalk_1.default.redBright(`ERROR: ${msg}`));
}
exports.logError = logError;
function logWarn(msg) {
    console.log(chalk_1.default.yellow(`WARNING: ${msg}`));
}
exports.logWarn = logWarn;
function logInfo(msg) {
    if (!config_1.execStateConfig.quiet()) {
        console.log(`${msg}`);
    }
}
exports.logInfo = logInfo;
function logSuccess(msg) {
    if (!config_1.execStateConfig.quiet()) {
        console.log(chalk_1.default.green(`${msg}`));
    }
}
exports.logSuccess = logSuccess;
function logDebug(msg) {
    if (config_1.execStateConfig.outputDebugLogs()) {
        console.log(msg);
    }
}
exports.logDebug = logDebug;
function logTip(msg, context) {
    if (!config_1.execStateConfig.quiet() && context.userConfig.data.tips) {
        console.log(chalk_1.default.gray([
            '',
            `${chalk_1.default.bold('tip')}: ${msg}`,
            chalk_1.default.italic('Feeling expert? "gt user tips --disable"'),
        ].join('\n')));
    }
}
exports.logTip = logTip;
function logNewline() {
    if (!config_1.execStateConfig.quiet()) {
        console.log('');
    }
}
exports.logNewline = logNewline;
//# sourceMappingURL=splog.js.map