"use strict";
exports.__esModule = true;
exports.logNewline = exports.logTip = exports.logDebug = exports.logSuccess = exports.logInfo = exports.logWarn = exports.logError = exports.logMessageFromGraphite = void 0;
var chalk_1 = require("chalk");
var config_1 = require("../config");
function logMessageFromGraphite(msg) {
    console.log(chalk_1["default"].yellow(msg) + '\n\n');
}
exports.logMessageFromGraphite = logMessageFromGraphite;
function logError(msg) {
    console.log(chalk_1["default"].redBright("ERROR: " + msg));
}
exports.logError = logError;
function logWarn(msg) {
    console.log(chalk_1["default"].yellow("WARNING: " + msg));
}
exports.logWarn = logWarn;
function logInfo(msg) {
    if (!config_1.execStateConfig.quiet()) {
        console.log("" + msg);
    }
}
exports.logInfo = logInfo;
function logSuccess(msg) {
    if (!config_1.execStateConfig.quiet()) {
        console.log(chalk_1["default"].green("" + msg));
    }
}
exports.logSuccess = logSuccess;
function logDebug(msg) {
    if (config_1.execStateConfig.outputDebugLogs()) {
        console.log(msg);
    }
}
exports.logDebug = logDebug;
function logTip(msg) {
    if (!config_1.execStateConfig.quiet() && config_1.userConfig.tipsEnabled()) {
        console.log(chalk_1["default"].gray([
            '',
            chalk_1["default"].bold('tip') + ": " + msg,
            chalk_1["default"].italic('Feeling expert? "gt user tips --disable"'),
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
