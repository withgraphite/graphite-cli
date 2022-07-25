"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.trackedReset = exports.softReset = void 0;
const run_command_1 = require("../utils/run_command");
function softReset(sha) {
    (0, run_command_1.runGitCommand)({
        args: [`reset`, `-q`, `--soft`, sha],
        onError: 'throw',
        resource: 'softReset',
    });
}
exports.softReset = softReset;
function trackedReset(sha) {
    (0, run_command_1.runGitCommand)({
        args: [`reset`, `-Nq`, sha],
        onError: 'throw',
        resource: 'trackedReset',
    });
}
exports.trackedReset = trackedReset;
//# sourceMappingURL=reset_branch.js.map