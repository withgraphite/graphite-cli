"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRemoteSha = exports.getSha = exports.getShaOrThrow = void 0;
const escape_for_shell_1 = require("../utils/escape_for_shell");
const exec_sync_1 = require("../utils/exec_sync");
function getShaOrThrow(ref) {
    return (0, exec_sync_1.gpExecSync)({ command: `git rev-parse ${(0, escape_for_shell_1.q)(ref)} 2>/dev/null` }, (err) => {
        throw err;
    });
}
exports.getShaOrThrow = getShaOrThrow;
function getSha(ref) {
    return ((0, exec_sync_1.gpExecSync)({
        command: `git rev-parse ${(0, escape_for_shell_1.q)(ref)} 2>/dev/null`,
    }) || undefined);
}
exports.getSha = getSha;
function getRemoteSha(ref, remote) {
    return ((0, exec_sync_1.gpExecSync)({
        command: `git ls-remote ${(0, escape_for_shell_1.q)(remote)} ${(0, escape_for_shell_1.q)(ref)} | cut -f1 -w`,
    }) || undefined);
}
exports.getRemoteSha = getRemoteSha;
//# sourceMappingURL=get_sha.js.map