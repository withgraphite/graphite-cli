"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.gpExecSync = void 0;
const child_process_1 = require("child_process");
const tracer_1 = __importDefault(require("../telemetry/tracer"));
function gpExecSync(command, onError) {
    try {
        // Only measure if we're with an existing span.
        if (tracer_1.default.currentSpanId) {
            return tracer_1.default.spanSync({
                name: "execSync",
                resource: "gpExecSync",
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
    var _a;
    const output = child_process_1.execSync(command.command, Object.assign({}, command.options));
    if ((_a = command.options) === null || _a === void 0 ? void 0 : _a.printStdout) {
        console.log(output.toString());
    }
    return output;
}
//# sourceMappingURL=exec_sync.js.map