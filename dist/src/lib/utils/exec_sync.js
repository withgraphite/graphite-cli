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
        return Buffer.alloc(0);
    }
}
exports.gpExecSync = gpExecSync;
function gpExecSyncImpl(command) {
    var _a, _b, _c;
    const output = child_process_1.execSync(command.command, Object.assign({}, command.options));
    if (((_a = command.options) === null || _a === void 0 ? void 0 : _a.printStdout) === true) {
        console.log(output.toString());
    }
    else if ((_b = command.options) === null || _b === void 0 ? void 0 : _b.printStdout) {
        console.log((_c = command.options) === null || _c === void 0 ? void 0 : _c.printStdout(output.toString()));
    }
    return output;
}
//# sourceMappingURL=exec_sync.js.map