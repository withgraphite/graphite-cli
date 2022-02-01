"use strict";
exports.__esModule = true;
/**
 * An in-memory object that configures global settings for the current
 * invocation of the Graphite CLI.
 */
var ExecStateConfig = /** @class */ (function () {
    function ExecStateConfig() {
        this._data = {};
    }
    ExecStateConfig.prototype.setOutputDebugLogs = function (outputDebugLogs) {
        this._data.outputDebugLogs = outputDebugLogs;
        return this;
    };
    ExecStateConfig.prototype.outputDebugLogs = function () {
        var _a;
        return (_a = this._data.outputDebugLogs) !== null && _a !== void 0 ? _a : false;
    };
    ExecStateConfig.prototype.setQuiet = function (quiet) {
        this._data.quiet = quiet;
        return this;
    };
    ExecStateConfig.prototype.quiet = function () {
        var _a;
        return (_a = this._data.quiet) !== null && _a !== void 0 ? _a : false;
    };
    ExecStateConfig.prototype.setNoVerify = function (noVerify) {
        this._data.noVerify = noVerify;
        return this;
    };
    ExecStateConfig.prototype.noVerify = function () {
        var _a;
        return (_a = this._data.noVerify) !== null && _a !== void 0 ? _a : false;
    };
    ExecStateConfig.prototype.setInteractive = function (interactive) {
        this._data.interactive = interactive;
        return this;
    };
    ExecStateConfig.prototype.interactive = function () {
        var _a;
        return (_a = this._data.interactive) !== null && _a !== void 0 ? _a : true;
    };
    return ExecStateConfig;
}());
var execStateConfig = new ExecStateConfig();
exports["default"] = execStateConfig;
