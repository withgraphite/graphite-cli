"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.gpExecSync = exports.gpExecSyncAndSplitLines = void 0;
const child_process_1 = require("child_process");
const cute_string_1 = require("./cute_string");
const tracer_1 = require("./tracer");
function gpExecSyncAndSplitLines(command) {
    return gpExecSync(command)
        .split('\n')
        .filter((l) => l.length > 0);
}
exports.gpExecSyncAndSplitLines = gpExecSyncAndSplitLines;
function gpExecSync(command, onError) {
    try {
        // Only measure if we're with an existing span.
        if (tracer_1.tracer.currentSpanId) {
            return tracer_1.tracer.spanSync({
                name: 'execSync',
                resource: 'gpExecSync',
                meta: { command: (0, cute_string_1.cuteString)(command) },
            }, () => {
                return gpExecSyncImpl(command);
            });
        }
        else {
            return gpExecSyncImpl(command);
        }
    }
    catch (e) {
        onError?.(e);
        return '';
    }
}
exports.gpExecSync = gpExecSync;
function gpExecSyncImpl(command) {
    const output = (0, child_process_1.execSync)(command.command, {
        ...command.options,
        encoding: 'utf-8',
    }) ?? ''; // this can return null, which is dumb
    if (command.options?.printStdout) {
        command.options.printStdout.splog.info(command.options.printStdout.transform
            ? command.options.printStdout.transform(output)
            : output);
    }
    return output.trim();
}
//# sourceMappingURL=exec_sync.js.map