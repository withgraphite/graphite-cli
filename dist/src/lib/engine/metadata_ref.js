"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMetadataRefList = exports.deleteMetadataRef = exports.readMetadataRef = exports.writeMetadataRef = void 0;
const cute_string_1 = require("../utils/cute_string");
const exec_sync_1 = require("../utils/exec_sync");
function writeMetadataRef(branchName, meta, opts) {
    const metaSha = (0, exec_sync_1.gpExecSync)({
        command: `git ${opts ? `-C "${opts.dir}"` : ''} hash-object -w --stdin`,
        options: {
            input: (0, cute_string_1.cuteString)(meta),
        },
    });
    (0, exec_sync_1.gpExecSync)({
        command: `git ${opts ? `-C "${opts.dir}"` : ''} update-ref refs/branch-metadata/${branchName} ${metaSha}`,
        options: {
            stdio: 'ignore',
        },
    });
}
exports.writeMetadataRef = writeMetadataRef;
function readMetadataRef(branchName, opts) {
    // TODO: Better account for malformed desc; possibly validate with retype
    try {
        return JSON.parse((0, exec_sync_1.gpExecSync)({
            command: `git ${opts ? `-C "${opts.dir}" ` : ''}cat-file -p refs/branch-metadata/${branchName} 2> /dev/null`,
        }));
    }
    catch {
        return {};
    }
}
exports.readMetadataRef = readMetadataRef;
function deleteMetadataRef(branchName) {
    (0, exec_sync_1.gpExecSync)({
        command: `git update-ref -d refs/branch-metadata/${branchName}`,
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