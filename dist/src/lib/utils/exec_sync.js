"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.gpExecSync = void 0;
const child_process_1 = require("child_process");
const tracer_1 = require("../telemetry/tracer");
function gpExecSync(command, onError) {
    try {
        // Only measure if we're with an existing span.
        if (tracer_1.tracer.currentSpanId) {
            return tracer_1.tracer.spanSync({
                name: 'execSync',
                resource: 'gpExecSync',
                meta: { command: command.command },
            }, () => {
                return gpExecSyncImpl(command);
            });
        }
        else {
            return gpExecSyncImpl(command);
        }
    }
    catch (e) {
        onError === null || onError === void 0 ? void 0 : onError(e);
        return '';
    }
}
exports.gpExecSync = gpExecSync;
function gpExecSyncImpl(command) {
    var _a, _b, _c, _d;
    const output = (_a = child_process_1.execSync(command.command, Object.assign(Object.assign({}, command.options), { encoding: 'utf-8' }))) !== null && _a !== void 0 ? _a : ''; // this can return null, which is dumb
    if (((_b = command.options) === null || _b === void 0 ? void 0 : _b.printStdout) === true) {
        console.log(output);
    }
    else if ((_c = command.options) === null || _c === void 0 ? void 0 : _c.printStdout) {
        console.log((_d = command.options) === null || _d === void 0 ? void 0 : _d.printStdout(output));
    }
    return output.trim();
}
//# sourceMappingURL=exec_sync.js.map