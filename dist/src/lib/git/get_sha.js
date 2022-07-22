"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRemoteSha = exports.getSha = exports.getShaOrThrow = void 0;
const run_command_1 = require("../utils/run_command");
function getShaOrThrow(ref) {
    return (0, run_command_1.runGitCommand)({
        args: [`rev-parse`, ref],
        onError: 'throw',
        resource: 'getShaOrThrow',
    });
}
exports.getShaOrThrow = getShaOrThrow;
function getSha(ref) {
    return (0, run_command_1.runGitCommand)({
        args: [`rev-parse`, ref],
        onError: 'ignore',
        resource: 'getSha',
    });
}
exports.getSha = getSha;
function getRemoteSha(ref, remote) {
    const output = (0, run_command_1.runGitCommand)({
        args: [`ls-remote`, remote, ref],
        onError: 'ignore',
        resource: 'getRemoteSha',
    });
    return output.slice(0, output.search(/\s/)) || undefined;
}
exports.getRemoteSha = getRemoteSha;
//# sourceMappingURL=get_sha.js.map