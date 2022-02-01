"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
exports.__esModule = true;
exports.gpExecSync = void 0;
var child_process_1 = require("child_process");
var tracer_1 = require("../telemetry/tracer");
function gpExecSync(command, onError) {
    try {
        // Only measure if we're with an existing span.
        if (tracer_1["default"].currentSpanId) {
            return tracer_1["default"].spanSync({
                name: 'execSync',
                resource: 'gpExecSync',
                meta: { command: command.command }
            }, function () {
                return gpExecSyncImpl(command);
            });
        }
        else {
            return gpExecSyncImpl(command);
        }
    }
    catch (e) {
        onError === null || onError === void 0 ? void 0 : onError(e);
        return Buffer.alloc(0);
    }
}
exports.gpExecSync = gpExecSync;
function gpExecSyncImpl(command) {
    var _a;
    var output = child_process_1.execSync(command.command, __assign({}, command.options));
    if ((_a = command.options) === null || _a === void 0 ? void 0 : _a.printStdout) {
        console.log(output.toString());
    }
    return output;
}
