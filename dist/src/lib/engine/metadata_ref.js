"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMetadataRefList = exports.deleteMetadataRef = exports.readMetadataRef = exports.writeMetadataRef = void 0;
const cute_string_1 = require("../utils/cute_string");
const escape_for_shell_1 = require("../utils/escape_for_shell");
const exec_sync_1 = require("../utils/exec_sync");
function writeMetadataRef(branchName, meta, cwd) {
    const metaSha = (0, exec_sync_1.gpExecSync)({
        command: `git hash-object -w --stdin`,
        options: {
            input: (0, cute_string_1.cuteString)(meta),
            cwd,
        },
    });
    (0, exec_sync_1.gpExecSync)({
        command: `git update-ref refs/branch-metadata/${(0, escape_for_shell_1.q)(branchName)} ${metaSha}`,
        options: {
            stdio: 'ignore',
            cwd,
        },
    });
}
exports.writeMetadataRef = writeMetadataRef;
function readMetadataRef(branchName, cwd) {
    // TODO: Better account for malformed desc; possibly validate with retype
    try {
        return JSON.parse((0, exec_sync_1.gpExecSync)({
            command: `git cat-file -p refs/branch-metadata/${(0, escape_for_shell_1.q)(branchName)} 2> /dev/null`,
            options: {
                cwd,
            },
        }));
    }
    catch {
        return {};
    }
}
exports.readMetadataRef = readMetadataRef;
function deleteMetadataRef(branchName) {
    (0, exec_sync_1.gpExecSync)({
        command: `git update-ref -d refs/branch-metadata/${(0, escape_for_shell_1.q)(branchName)}`,
    });
}
exports.deleteMetadataRef = deleteMetadataRef;
function getMetadataRefList() {
    const meta = {};
    (0, exec_sync_1.gpExecSyncAndSplitLines)({
        command: `git for-each-ref --format='%(refname:lstrip=2):%(objectname)' refs/branch-metadata/`,
    })
        .map((line) => line.split(':'))
        .filter((lineSplit) => lineSplit.length === 2 && lineSplit.every((s) => s.length > 0))
        .forEach(([branchName, metaSha]) => (meta[branchName] = metaSha));
    return meta;
}
exports.getMetadataRefList = getMetadataRefList;
//# sourceMappingURL=metadata_ref.js.map