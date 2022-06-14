"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.writeFetchBase = exports.readFetchBase = exports.readFetchHead = exports.fetchBranch = void 0;
const escape_for_shell_1 = require("../utils/escape_for_shell");
const exec_sync_1 = require("../utils/exec_sync");
const get_sha_1 = require("./get_sha");
const FETCH_HEAD = 'refs/gt-metadata/FETCH_HEAD';
const FETCH_BASE = 'refs/gt-metadata/FETCH_BASE';
function fetchBranch(remote, branchName) {
    (0, exec_sync_1.gpExecSync)({
        command: `git fetch --no-write-fetch-head -q  ${(0, escape_for_shell_1.q)(branchName)} +${(0, escape_for_shell_1.q)(branchName)}:${FETCH_HEAD}`,
    }, (err) => {
        throw err;
    });
}
exports.fetchBranch = fetchBranch;
function readFetchHead() {
    return (0, get_sha_1.getShaOrThrow)(FETCH_HEAD);
}
exports.readFetchHead = readFetchHead;
function readFetchBase() {
    return (0, get_sha_1.getShaOrThrow)(FETCH_BASE);
}
exports.readFetchBase = readFetchBase;
function writeFetchBase(sha) {
    (0, exec_sync_1.gpExecSync)({ command: `git update-ref ${FETCH_BASE} ${(0, escape_for_shell_1.q)(sha)}` }, (err) => {
        throw err;
    });
}
exports.writeFetchBase = writeFetchBase;
//# sourceMappingURL=fetch_branch.js.map