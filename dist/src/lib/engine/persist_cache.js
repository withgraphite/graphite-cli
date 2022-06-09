"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearPersistedCache = exports.hashCacheOrKey = exports.persistCache = void 0;
const sorted_branch_names_1 = require("../git/sorted_branch_names");
const exec_sync_1 = require("../utils/exec_sync");
const cache_loader_1 = require("./cache_loader");
const metadata_ref_1 = require("./metadata_ref");
function persistCache(trunkName, cachedBranches, splog) {
    splog.debug(`Persisting cache checksum to ${cache_loader_1.CACHE_CHECK_REF}...`);
    (0, exec_sync_1.gpExecSync)({
        command: `git update-ref ${cache_loader_1.CACHE_CHECK_REF} ${hashCacheOrKey({
            trunkName: trunkName,
            gitBranchNamesAndRevisions: (0, sorted_branch_names_1.getBranchNamesAndRevisions)(),
            metadataRefList: (0, metadata_ref_1.getMetadataRefList)(),
        }, true)}`,
    }, (err) => {
        throw err;
    });
    splog.debug(`Persisting cache data to ${cache_loader_1.CACHE_DATA_REF}...`);
    (0, exec_sync_1.gpExecSync)({
        command: `git update-ref ${cache_loader_1.CACHE_DATA_REF} ${hashCacheOrKey(cachedBranches, true)}`,
    });
    splog.debug(`Persisted cache`);
}
exports.persistCache = persistCache;
function hashCacheOrKey(state, write) {
    return (0, exec_sync_1.gpExecSync)({
        command: `git hash-object ${write ? '-w' : ''} --stdin`,
        options: {
            input: JSON.stringify(state),
        },
    }, (err) => {
        throw err;
    });
}
exports.hashCacheOrKey = hashCacheOrKey;
function clearPersistedCache(splog) {
    splog.debug(`Deleting ${cache_loader_1.CACHE_CHECK_REF}...`);
    (0, exec_sync_1.gpExecSync)({ command: `git update-ref -d ${cache_loader_1.CACHE_CHECK_REF}` });
    splog.debug(`Deleting ${cache_loader_1.CACHE_DATA_REF}...`);
    (0, exec_sync_1.gpExecSync)({ command: `git update-ref -d ${cache_loader_1.CACHE_DATA_REF}` });
    splog.debug(`Cleared cache`);
}
exports.clearPersistedCache = clearPersistedCache;
//# sourceMappingURL=persist_cache.js.map