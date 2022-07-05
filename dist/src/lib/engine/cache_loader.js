"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.composeCacheLoader = void 0;
const package_json_1 = require("../../../package.json");
const sorted_branch_names_1 = require("../git/sorted_branch_names");
const cache_spf_1 = require("../spiffy/cache_spf");
const exec_sync_1 = require("../utils/exec_sync");
const metadata_ref_1 = require("./metadata_ref");
const parse_branches_and_meta_1 = require("./parse_branches_and_meta");
function composeCacheLoader(splog) {
    const persistedCache = cache_spf_1.cachePersistenceFactory.load();
    return {
        loadCachedBranches: (trunkName) => {
            splog.debug('Reading cache seed data...');
            const cacheSeed = getCacheSeed(trunkName);
            splog.debug('Loading cache...');
            return ((persistedCache.data.sha === hashSeed(cacheSeed) &&
                Object.fromEntries(persistedCache.data.branches)) ||
                (0, parse_branches_and_meta_1.parseBranchesAndMeta)({
                    ...cacheSeed,
                    trunkName,
                }, splog));
        },
        persistCache: (trunkName, cachedBranches) => {
            splog.debug(`Persisting cache...`);
            persistedCache.update((data) => {
                data.sha = hashSeed(getCacheSeed(trunkName));
                data.branches = Object.entries(cachedBranches);
            });
        },
        clearPersistedCache: () => {
            splog.debug(`Clearing persisted cache...`);
            persistedCache.delete();
        },
    };
}
exports.composeCacheLoader = composeCacheLoader;
function getCacheSeed(trunkName) {
    return {
        version: package_json_1.version,
        trunkName,
        gitBranchNamesAndRevisions: (0, sorted_branch_names_1.getBranchNamesAndRevisions)(),
        metadataRefList: (0, metadata_ref_1.getMetadataRefList)(),
    };
}
function hashSeed(data) {
    return (0, exec_sync_1.gpExecSync)({
        command: `git hash-object --stdin`,
        options: {
            input: JSON.stringify(data),
        },
    }, (err) => {
        throw err;
    });
}
//# sourceMappingURL=cache_loader.js.map