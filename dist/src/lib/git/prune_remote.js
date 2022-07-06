"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pruneRemote = void 0;
const escape_for_shell_1 = require("../utils/escape_for_shell");
const exec_sync_1 = require("../utils/exec_sync");
function pruneRemote(remote) {
    (0, exec_sync_1.gpExecSync)({ command: `git remote prune ${(0, escape_for_shell_1.q)(remote)}` });
}
exports.pruneRemote = pruneRemote;
//# sourceMappingURL=prune_remote.js.map