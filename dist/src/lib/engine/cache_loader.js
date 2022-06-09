"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadCachedBranches = exports.CACHE_DATA_REF = exports.CACHE_CHECK_REF = void 0;
const get_sha_1 = require("../git/get_sha");
const sorted_branch_names_1 = require("../git/sorted_branch_names");
const exec_sync_1 = require("../utils/exec_sync");
const metadata_ref_1 = require("./metadata_ref");
const parse_branches_and_meta_1 = require("./parse_branches_and_meta");
const persist_cache_1 = require("./persist_cache");
exports.CACHE_CHECK_REF = 'refs/gt-metadata/GRAPHITE_CACHE_CHECK';
exports.CACHE_DATA_REF = 'refs/gt-metadata/GRAPHITE_CACHE_DATA';
function loadCachedBranches(args, splog) {
    splog.debug('Reading branches and metadata...');
    const cacheKey = {
        trunkName: args.trunkName,
        gitBranchNamesAndRevisions: (0, sorted_branch_names_1.getBranchNamesAndRevisions)(),
        metadataRefList: (0, metadata_ref_1.getMetadataRefList)(),
    };
    return ((args.ignorePersistedCache
        ? undefined
        : getPersistedCacheIfValid(cacheKey, splog)) ??
        (0, parse_branches_and_meta_1.parseBranchesAndMeta)({
            pruneMeta: true,
            gitBranchNamesAndRevisions: cacheKey.gitBranchNamesAndRevisions,
            metaRefNames: Object.keys(cacheKey.metadataRefList),
            trunkName: args.trunkName,
        }, splog));
}
exports.loadCachedBranches = loadCachedBranches;
function getPersistedCacheIfValid(cacheKey, splog) {
    const cacheCheckSha = (0, get_sha_1.getSha)(exports.CACHE_CHECK_REF);
    const currentStateSha = (0, persist_cache_1.hashCacheOrKey)(cacheKey);
    splog.debug(`Cache check SHA: ${cacheCheckSha}`);
    splog.debug(`Current state SHA: ${currentStateSha}`);
    return cacheCheckSha === currentStateSha ? readPersistedCache() : undefined;
}
function readPersistedCache() {
    // TODO: validate with retype
    try {
        return JSON.parse((0, exec_sync_1.gpExecSync)({
            command: `git cat-file -p ${exports.CACHE_DATA_REF}`,
        }));
    }
    catch {
        return undefined;
    }
}
//# sourceMappingURL=cache_loader.js.map