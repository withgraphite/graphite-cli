"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runCommand = exports.runGitCommand = exports.runGitCommandAndSplitLines = void 0;
const child_process_1 = require("child_process");
const errors_1 = require("../errors");
const cute_string_1 = require("./cute_string");
const tracer_1 = require("./tracer");
function runGitCommandAndSplitLines(params) {
    return runGitCommand(params)
        .split('\n')
        .filter((l) => l.length > 0);
}
exports.runGitCommandAndSplitLines = runGitCommandAndSplitLines;
function runGitCommand(params) {
    // Only measure if we're with an existing span.
    return params.resource && tracer_1.tracer.currentSpanId
        ? tracer_1.tracer.spanSync({
            name: 'spawnedCommand',
            resource: params.resource,
            meta: { runCommandArgs: (0, cute_string_1.cuteString)(params) },
        }, () => {
            return runCommand({ command: 'git', ...params });
        })
        : runCommand({ command: 'git', ...params });
}
exports.runGitCommand = runGitCommand;
function runCommand(params) {
    const spawnSyncOutput = (0, child_process_1.spawnSync)(params.command, params.args, {
        ...params.options,
        encoding: 'utf-8',
    });
    // this is a syscall failure, not a command failure
    if (spawnSyncOutput.error) {
        throw spawnSyncOutput.error;
    }
    // if killed with a signal
    if (spawnSyncOutput.signal) {
        throw new errors_1.KilledError();
    }
    // command succeeded, return output
    if (!spawnSyncOutput.status) {
        return spawnSyncOutput.stdout?.trim() || '';
    }
    // command failed but we ignore it
    if (params.onError === 'ignore') {
        return '';
    }
    // if a lambda is passed, first we run it, then throw
    if (params.onError !== 'throw') {
        params.onError();
    }
    throw new errors_1.CommandFailedError({
        command: params.command,
        args: params.args,
        status: spawnSyncOutput.status,
        stdout: spawnSyncOutput.stdout,
        stderr: spawnSyncOutput.stderr,
    });
}
exports.runCommand = runCommand;
//# sourceMappingURL=run_command.js.map