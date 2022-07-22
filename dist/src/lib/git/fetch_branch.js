"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.writeFetchBase = exports.readFetchBase = exports.readFetchHead = exports.fetchBranch = void 0;
const run_command_1 = require("../utils/run_command");
const get_sha_1 = require("./get_sha");
const FETCH_HEAD = 'refs/gt-metadata/FETCH_HEAD';
const FETCH_BASE = 'refs/gt-metadata/FETCH_BASE';
function fetchBranch(remote, branchName) {
    (0, run_command_1.runGitCommand)({
        args: [
            `fetch`,
            `--no-write-fetch-head`,
            `-f`,
            remote,
            `${branchName}:${FETCH_HEAD}`,
        ],
        options: { stdio: 'pipe' },
        onError: 'throw',
        resource: 'fetchBranch',
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
    (0, run_command_1.runGitCommand)({
        args: [`update-ref`, FETCH_BASE, sha],
        options: { stdio: 'pipe' },
        onError: 'throw',
        resource: 'writeFetchBase',
    });
}
exports.writeFetchBase = writeFetchBase;
//# sourceMappingURL=fetch_branch.js.map