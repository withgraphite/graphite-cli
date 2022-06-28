"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearPersistedCache = exports.persistCache = exports.loadCachedBranches = void 0;
const get_sha_1 = require("../git/get_sha");
const sorted_branch_names_1 = require("../git/sorted_branch_names");
const exec_sync_1 = require("../utils/exec_sync");
const metadata_ref_1 = require("./metadata_ref");
const parse_branches_and_meta_1 = require("./parse_branches_and_meta");
const CACHE_CHECK_REF = 'refs/gt-metadata/GRAPHITE_CACHE_CHECK';
const CACHE_DATA_REF = 'refs/gt-metadata/GRAPHITE_CACHE_DATA';
function loadCachedBranches(trunkName, splog) {
    splog.debug('Reading cache seed data...');
    const cacheKey = {
        trunkName,
        gitBranchNamesAndRevisions: (0, sorted_branch_names_1.getBranchNamesAndRevisions)(),
        metadataRefList: (0, metadata_ref_1.getMetadataRefList)(),
    };
    splog.debug('Loading cache...');
    return (((0, get_sha_1.getSha)(CACHE_CHECK_REF) === hashCacheOrSeed(cacheKey) &&
        readPersistedCache()) ||
        (0, parse_branches_and_meta_1.parseBranchesAndMeta)({
            ...cacheKey,
            trunkName,
        }, splog));
}
exports.loadCachedBranches = loadCachedBranches;
function readPersistedCache() {
    // TODO: validate with retype
    try {
        return JSON.parse((0, exec_sync_1.gpExecSync)({
            command: `git cat-file -p ${CACHE_DATA_REF}`,
        }));
    }
    catch {
        return undefined;
    }
}
function persistCache(trunkName, cachedBranches, splog) {
    splog.debug(`Persisting cache checksum to ${CACHE_CHECK_REF}...`);
    (0, exec_sync_1.gpExecSync)({
        command: `git update-ref ${CACHE_CHECK_REF} ${hashCacheOrSeed({
            trunkName: trunkName,
            gitBranchNamesAndRevisions: (0, sorted_branch_names_1.getBranchNamesAndRevisions)(),
            metadataRefList: (0, metadata_ref_1.getMetadataRefList)(),
        }, true)}`,
    }, (err) => {
        throw err;
    });
    splog.debug(`Persisting cache data to ${CACHE_DATA_REF}...`);
    (0, exec_sync_1.gpExecSync)({
        command: `git update-ref ${CACHE_DATA_REF} ${hashCacheOrSeed(cachedBranches, true)}`,
    });
    splog.debug(`Persisted cache`);
}
exports.persistCache = persistCache;
function hashCacheOrSeed(data, write) {
    return (0, exec_sync_1.gpExecSync)({
        command: `git hash-object ${write ? '-w' : ''} --stdin`,
        options: {
            input: JSON.stringify(data),
        },
    }, (err) => {
        throw err;
    });
}
function clearPersistedCache(splog) {
    splog.debug(`Deleting ${CACHE_CHECK_REF}...`);
    (0, exec_sync_1.gpExecSync)({ command: `git update-ref -d ${CACHE_CHECK_REF}` });
    splog.debug(`Deleting ${CACHE_DATA_REF}...`);
    (0, exec_sync_1.gpExecSync)({ command: `git update-ref -d ${CACHE_DATA_REF}` });
    splog.debug(`Cleared cache`);
}
exports.clearPersistedCache = clearPersistedCache;
//# sourceMappingURL=cache_loader.js.map