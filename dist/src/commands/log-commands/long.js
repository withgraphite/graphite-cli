"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = exports.canonical = exports.aliases = exports.builder = exports.description = exports.command = void 0;
const runner_1 = require("../../lib/runner");
const exec_sync_1 = require("../../lib/utils/exec_sync");
const args = {};
exports.command = 'long';
exports.description = 'Display a graph of the commit ancestry of all branches.';
exports.builder = args;
exports.aliases = ['l'];
exports.canonical = 'log long';
const handler = async (argv) => {
    return (0, runner_1.graphite)(argv, exports.canonical, async () => {
        // If this flag is passed, print the old logging style:
        (0, exec_sync_1.gpExecSync)({
            command: `git log --graph --abbrev-commit --decorate --format=format:'%C(bold blue)%h%C(reset) - %C(bold green)(%ar)%C(reset) %C(white)%s%C(reset) %C(dim white)- %an%C(reset)%C(auto)%d%C(reset)' --branches`,
            options: { stdio: 'inherit' },
        });
    });
};
exports.handler = handler;
//# sourceMappingURL=long.js.map