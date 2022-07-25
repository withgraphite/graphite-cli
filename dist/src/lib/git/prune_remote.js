"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pruneRemote = void 0;
const run_command_1 = require("../utils/run_command");
function pruneRemote(remote) {
    (0, run_command_1.runGitCommand)({
        args: [`remote`, `prune`, remote],
        onError: 'ignore',
        resource: 'pruneRemote',
    });
}
exports.pruneRemote = pruneRemote;
//# sourceMappingURL=prune_remote.js.map