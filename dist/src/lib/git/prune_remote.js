"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pruneRemote = void 0;
const exec_sync_1 = require("../utils/exec_sync");
function pruneRemote(remote) {
    (0, exec_sync_1.gpExecSync)({ command: `git remote prune ${remote}` });
}
exports.pruneRemote = pruneRemote;
//# sourceMappingURL=prune_remote.js.map