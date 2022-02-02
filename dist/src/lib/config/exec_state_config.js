"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * An in-memory object that configures global settings for the current
 * invocation of the Graphite CLI.
 */
class ExecStateConfig {
    constructor() {
        this._data = {};
    }
    setOutputDebugLogs(outputDebugLogs) {
        this._data.outputDebugLogs = outputDebugLogs;
        return this;
    }
    outputDebugLogs() {
        var _a;
        return (_a = this._data.outputDebugLogs) !== null && _a !== void 0 ? _a : false;
    }
    setQuiet(quiet) {
        this._data.quiet = quiet;
        return this;
    }
    quiet() {
        var _a;
        return (_a = this._data.quiet) !== null && _a !== void 0 ? _a : false;
    }
    setNoVerify(noVerify) {
        this._data.noVerify = noVerify;
        return this;
    }
    noVerify() {
        var _a;
        return (_a = this._data.noVerify) !== null && _a !== void 0 ? _a : false;
    }
    setInteractive(interactive) {
        this._data.interactive = interactive;
        return this;
    }
    interactive() {
        var _a;
        return (_a = this._data.interactive) !== null && _a !== void 0 ? _a : true;
    }
}
const execStateConfig = new ExecStateConfig();
exports.default = execStateConfig;
//# sourceMappingURL=exec_state_config.js.map