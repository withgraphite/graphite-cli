"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.composeMetaCache = void 0;
const errors_1 = require("../errors");
const branch_move_1 = require("../git/branch_move");
const commit_1 = require("../git/commit");
const commit_range_1 = require("../git/commit_range");
const current_branch_name_1 = require("../git/current_branch_name");
const delete_branch_1 = require("../git/delete_branch");
const diff_1 = require("../git/diff");
const fetch_branch_1 = require("../git/fetch_branch");
const get_sha_1 = require("../git/get_sha");
const is_merged_1 = require("../git/is_merged");
const merge_base_1 = require("../git/merge_base");
const prune_remote_1 = require("../git/prune_remote");
const pull_branch_1 = require("../git/pull_branch");
const push_branch_1 = require("../git/push_branch");
const rebase_1 = require("../git/rebase");
const set_remote_tracking_1 = require("../git/set_remote_tracking");
const switch_branch_1 = require("../git/switch_branch");
const write_branch_1 = require("../git/write_branch");
const cute_string_1 = require("../utils/cute_string");
const cached_meta_1 = require("./cached_meta");
const cache_loader_1 = require("./cache_loader");
const metadata_ref_1 = require("./metadata_ref");
const parse_branches_and_meta_1 = require("./parse_branches_and_meta");
// eslint-disable-next-line max-lines-per-function
function composeMetaCache({ trunkName, currentBranchOverride, splog, noVerify, remote, }) {
    const cache = {
        currentBranch: currentBranchOverride ?? (0, current_branch_name_1.getCurrentBranchName)(),
        branches: (0, cache_loader_1.loadCachedBranches)(trunkName, splog),
    };
    const assertTrunk = () => {
        if (!trunkName) {
            throw new errors_1.PreconditionsFailedError(`No trunk found.`);
        }
        return trunkName;
    };
    const branchExists = (branchName) => branchName !== undefined && branchName in cache.branches;
    const assertBranch = (branchName) => {
        if (!branchExists(branchName)) {
            throw new errors_1.PreconditionsFailedError(`${branchName} is unknown to Graphite.`);
        }
    };
    const canTrackBranch = (branchName, parentBranchName) => {
        assertBranch(branchName);
        assertBranch(parentBranchName);
        const parentMeta = cache.branches[parentBranchName];
        (0, cached_meta_1.assertCachedMetaIsValidOrTrunk)(parentMeta);
        // We allow children of trunk to be tracked even if they are behind.
        // So only fail if the parent is not trunk AND the branch is behind
        return (parentMeta.validationResult === 'TRUNK' ||
            (0, merge_base_1.getMergeBase)(branchName, parentBranchName) === parentMeta.branchRevision);
    };
    const isBranchFixed = (branchName) => {
        const cachedMeta = cache.branches[branchName];
        if (cachedMeta?.validationResult === 'TRUNK') {
            return true;
        }
        if (cachedMeta?.validationResult !== 'VALID') {
            return false;
        }
        splog.debug(`${branchName} fixed?`);
        splog.debug(`${cachedMeta.parentBranchRevision}`);
        splog.debug(`${cache.branches[cachedMeta.parentBranchName].branchRevision}`);
        return (cachedMeta.parentBranchRevision ===
            cache.branches[cachedMeta.parentBranchName].branchRevision);
    };
    const getChildren = (branchName) => cache.branches[branchName].children.filter((childBranchName) => cache.branches[childBranchName]?.validationResult === 'VALID');
    const getRecursiveChildren = (branchName) => getChildren(branchName).flatMap((child) => [
        child,
        ...getRecursiveChildren(child),
    ]);
    const removeChild = (parentBranchName, childBranchName) => {
        assertBranch(parentBranchName);
        const parentCachedChildren = cache.branches[parentBranchName].children;
        const index = parentCachedChildren.indexOf(childBranchName);
        if (index > -1) {
            parentCachedChildren.splice(index, 1);
        }
    };
    const setParent = (branchName, parentBranchName) => {
        const cachedMeta = cache.branches[branchName];
        (0, cached_meta_1.assertCachedMetaIsValidAndNotTrunk)(cachedMeta);
        const oldParentBranchName = cachedMeta.parentBranchName;
        if (oldParentBranchName === parentBranchName) {
            return;
        }
        updateMeta(branchName, { ...cachedMeta, parentBranchName });
    };
    const getParent = (branchName) => {
        const meta = cache.branches[branchName];
        return meta.validationResult === 'BAD_PARENT_NAME' ||
            meta.validationResult === 'TRUNK'
            ? undefined
            : meta.parentBranchName;
    };
    const getRecursiveParentsExcludingTrunk = (branchName) => {
        const parent = getParent(branchName);
        return parent && parent !== trunkName
            ? [...getRecursiveParentsExcludingTrunk(parent), parent]
            : [];
    };
    const checkoutBranch = (branchName) => {
        if (cache.currentBranch === branchName) {
            return;
        }
        assertBranch(branchName);
        (0, switch_branch_1.switchBranch)(branchName);
        cache.currentBranch = branchName;
    };
    // Any writes should go through this function, which:
    // Validates the new metadata
    // Updates children of the old+new parent
    // Writes to disk
    // Revalidates 'INVALID_PARENT' children
    const updateMeta = (branchName, newCachedMeta) => {
        // Get current meta and ensure this branch isn't trunk.
        const oldCachedMeta = cache.branches[branchName] ?? {
            validationResult: 'BAD_PARENT_NAME',
            branchRevision: (0, get_sha_1.getShaOrThrow)(branchName),
            children: [],
        };
        (0, cached_meta_1.assertCachedMetaIsNotTrunk)(oldCachedMeta);
        // Get new cached meta and handle updating children
        cache.branches[branchName] = newCachedMeta;
        const oldParentBranchName = oldCachedMeta.validationResult === 'BAD_PARENT_NAME'
            ? undefined
            : oldCachedMeta.parentBranchName;
        const newParentBranchName = newCachedMeta.parentBranchName;
        assertBranch(newParentBranchName);
        if (oldParentBranchName !== newParentBranchName) {
            if (oldParentBranchName && oldParentBranchName in cache.branches) {
                removeChild(oldParentBranchName, branchName);
            }
            cache.branches[newParentBranchName].children.push(branchName);
        }
        // Write to disk
        (0, metadata_ref_1.writeMetadataRef)(branchName, {
            parentBranchName: newCachedMeta.parentBranchName,
            parentBranchRevision: newCachedMeta.parentBranchRevision,
            prInfo: newCachedMeta.prInfo,
        });
        splog.debug(`Updated cached meta for branch ${branchName}:\n${(0, cute_string_1.cuteString)(newCachedMeta)}`);
        // Any 'INVALID_PARENT' children can be revalidated
        if (oldCachedMeta.validationResult !== 'VALID') {
            revalidateChildren(newCachedMeta.children);
        }
    };
    const revalidateChildren = (children) => {
        children.forEach((childBranchName) => {
            assertBranch(childBranchName);
            const childCachedMeta = cache.branches[childBranchName];
            if (childCachedMeta.validationResult !== 'INVALID_PARENT') {
                return;
            }
            const result = (0, parse_branches_and_meta_1.validateOrFixParentBranchRevision)({
                branchName: childBranchName,
                ...childCachedMeta,
                parentBranchCurrentRevision: cache.branches[childCachedMeta.parentBranchName].branchRevision,
            }, splog);
            cache.branches[childBranchName] = { ...childCachedMeta, ...result };
            // fix children recursively
            revalidateChildren(childCachedMeta.children);
        });
    };
    const handleRebase = (branchName) => {
        const cachedMeta = cache.branches[branchName];
        (0, cached_meta_1.assertCachedMetaIsValidAndNotTrunk)(cachedMeta);
        updateMeta(branchName, {
            ...cachedMeta,
            branchRevision: (0, get_sha_1.getShaOrThrow)(branchName),
            parentBranchRevision: cache.branches[cachedMeta.parentBranchName].branchRevision,
        });
        if (cache.currentBranch && cache.currentBranch in cache.branches) {
            (0, switch_branch_1.switchBranch)(cache.currentBranch);
        }
    };
    return {
        debug() {
            splog.debug((0, cute_string_1.cuteString)(cache));
        },
        persist() {
            (0, cache_loader_1.persistCache)(trunkName, cache.branches, splog);
        },
        clear() {
            (0, cache_loader_1.clearPersistedCache)(splog);
        },
        rebuild(newTrunkName) {
            trunkName = newTrunkName ?? trunkName;
            cache.branches = (0, cache_loader_1.loadCachedBranches)(trunkName, splog);
        },
        get trunk() {
            return assertTrunk();
        },
        isTrunk: (branchName) => branchName === trunkName,
        branchExists,
        get allBranchNames() {
            return Object.keys(cache.branches);
        },
        isBranchTracked: (branchName) => {
            assertBranch(branchName);
            return cache.branches[branchName].validationResult === 'VALID';
        },
        canTrackBranch,
        trackBranch: (branchName, parentBranchName) => {
            if (!canTrackBranch(branchName, parentBranchName)) {
                // escape hatch
                return;
            }
            updateMeta(branchName, {
                ...cache.branches[branchName],
                validationResult: 'VALID',
                parentBranchName,
                // This is parentMeta.branchRevision unless parent is trunk
                parentBranchRevision: (0, merge_base_1.getMergeBase)(branchName, parentBranchName),
            });
            return 'TRACKED';
        },
        untrackBranch: (branchName) => {
            assertBranch(branchName);
            const cachedMeta = cache.branches[branchName];
            (0, cached_meta_1.assertCachedMetaIsValidAndNotTrunk)(cachedMeta);
            (0, metadata_ref_1.deleteMetadataRef)(branchName);
            cache.branches[branchName] = {
                ...cachedMeta,
                validationResult: 'BAD_PARENT_NAME',
            };
            // We have to fix validation state for any recursive children
            const childrenToUntrack = cachedMeta.children.slice();
            while (childrenToUntrack.length) {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                const childBranchName = childrenToUntrack.pop();
                const childCachedMeta = cache.branches[childBranchName];
                (0, cached_meta_1.assertCachedMetaIsNotTrunk)(childCachedMeta);
                if (childCachedMeta.validationResult !== 'BAD_PARENT_NAME') {
                    cache.branches[childBranchName] = {
                        ...childCachedMeta,
                        validationResult: 'INVALID_PARENT',
                    };
                }
                childrenToUntrack.concat(childCachedMeta.children);
            }
        },
        get currentBranch() {
            return cache.currentBranch;
        },
        get currentBranchPrecondition() {
            assertBranch(cache.currentBranch);
            (0, cached_meta_1.assertCachedMetaIsValidOrTrunk)(cache.branches[cache.currentBranch]);
            return cache.currentBranch;
        },
        getRevision: (branchName) => {
            assertBranch(branchName);
            const meta = cache.branches[branchName];
            return meta.branchRevision;
        },
        getBaseRevision: (branchName) => {
            assertBranch(branchName);
            const meta = cache.branches[branchName];
            (0, cached_meta_1.assertCachedMetaIsValidAndNotTrunk)(meta);
            return meta.parentBranchRevision;
        },
        getAllCommits: (branchName, format) => {
            assertBranch(branchName);
            const meta = cache.branches[branchName];
            (0, cached_meta_1.assertCachedMetaIsValidAndNotTrunk)(meta);
            return (0, commit_range_1.getCommitRange)(meta.parentBranchRevision, meta.branchRevision, format);
        },
        getPrInfo: (branchName) => {
            const meta = cache.branches[branchName];
            return meta?.validationResult === 'TRUNK' ? undefined : meta.prInfo;
        },
        upsertPrInfo: (branchName, prInfo) => {
            const meta = cache.branches[branchName];
            if (meta?.validationResult !== 'VALID') {
                return;
            }
            updateMeta(branchName, {
                ...meta,
                prInfo: { ...meta.prInfo, ...prInfo },
            });
        },
        getChildren,
        setParent,
        getParent,
        getParentPrecondition: (branchName) => {
            assertBranch(branchName);
            const meta = cache.branches[branchName];
            (0, cached_meta_1.assertCachedMetaIsValidAndNotTrunk)(meta);
            return meta.parentBranchName;
        },
        getRelativeStack: (branchName, scope) => {
            assertBranch(branchName);
            const meta = cache.branches[branchName];
            (0, cached_meta_1.assertCachedMetaIsValidOrTrunk)(meta);
            // Only includes trunk if branchName is trunk
            return [
                ...(scope.recursiveParents
                    ? getRecursiveParentsExcludingTrunk(branchName)
                    : []),
                ...(scope.currentBranch ? [branchName] : []),
                ...(scope.recursiveChildren ? getRecursiveChildren(branchName) : []),
            ];
        },
        checkoutNewBranch: (branchName) => {
            const parentBranchName = cache.currentBranch;
            assertBranch(parentBranchName);
            const parentCachedMeta = cache.branches[parentBranchName];
            (0, cached_meta_1.assertCachedMetaIsValidOrTrunk)(parentCachedMeta);
            (0, switch_branch_1.switchBranch)(branchName, { new: true });
            updateMeta(branchName, {
                validationResult: 'VALID',
                parentBranchName,
                parentBranchRevision: parentCachedMeta.branchRevision,
                branchRevision: parentCachedMeta.branchRevision,
                children: [],
            });
            cache.currentBranch = branchName;
        },
        checkoutBranch,
        renameCurrentBranch: (branchName) => {
            assertBranch(cache.currentBranch);
            const cachedMeta = cache.branches[cache.currentBranch];
            (0, cached_meta_1.assertCachedMetaIsValidAndNotTrunk)(cachedMeta);
            (0, branch_move_1.branchMove)(branchName);
            updateMeta(branchName, { ...cachedMeta, prInfo: {} });
            cachedMeta.children.forEach((childBranchName) => setParent(childBranchName, branchName));
            delete cache.branches[cache.currentBranch];
            (0, metadata_ref_1.deleteMetadataRef)(cache.currentBranch);
            cache.currentBranch = branchName;
        },
        deleteBranch: (branchName) => {
            assertBranch(branchName);
            const cachedMeta = cache.branches[branchName];
            (0, cached_meta_1.assertCachedMetaIsValidAndNotTrunk)(cachedMeta);
            if (branchName === cache.currentBranch) {
                checkoutBranch(cachedMeta.parentBranchName);
            }
            cachedMeta.children.forEach((childBranchName) => setParent(childBranchName, cachedMeta.parentBranchName));
            removeChild(cachedMeta.parentBranchName, branchName);
            delete cache.branches[branchName];
            (0, delete_branch_1.deleteBranch)(branchName);
            (0, metadata_ref_1.deleteMetadataRef)(branchName);
        },
        commit: (opts) => {
            assertBranch(cache.currentBranch);
            const cachedMeta = cache.branches[cache.currentBranch];
            (0, cached_meta_1.assertCachedMetaIsValidAndNotTrunk)(cachedMeta);
            (0, commit_1.commit)({ ...opts, noVerify });
            cache.branches[cache.currentBranch] = {
                ...cachedMeta,
                branchRevision: (0, get_sha_1.getShaOrThrow)(cache.currentBranch),
            };
        },
        restackBranch: (branchName) => {
            assertBranch(branchName);
            const cachedMeta = cache.branches[branchName];
            (0, cached_meta_1.assertCachedMetaIsValidOrTrunk)(cachedMeta);
            if (isBranchFixed(branchName)) {
                return 'REBASE_UNNEEDED';
            }
            (0, cached_meta_1.assertCachedMetaIsNotTrunk)(cachedMeta);
            if ((0, rebase_1.restack)({
                branchName,
                parentBranchName: cachedMeta.parentBranchName,
                parentBranchRevision: cachedMeta.parentBranchRevision,
            }) === 'REBASE_CONFLICT') {
                return 'REBASE_CONFLICT';
            }
            handleRebase(branchName);
            return 'REBASE_DONE';
        },
        rebaseInteractive: (branchName) => {
            assertBranch(branchName);
            const cachedMeta = cache.branches[branchName];
            (0, cached_meta_1.assertCachedMetaIsValidAndNotTrunk)(cachedMeta);
            if ((0, rebase_1.rebaseInteractive)({
                branchName,
                parentBranchRevision: cachedMeta.parentBranchRevision,
            }) === 'REBASE_CONFLICT') {
                return 'REBASE_CONFLICT';
            }
            handleRebase(branchName);
            return 'REBASE_DONE';
        },
        continueRebase: () => {
            const result = (0, rebase_1.restackContinue)();
            if (result === 'REBASE_CONFLICT') {
                return { result };
            }
            const branchName = (0, current_branch_name_1.getCurrentBranchName)();
            assertBranch(branchName);
            const cachedMeta = cache.branches[branchName];
            (0, cached_meta_1.assertCachedMetaIsValidAndNotTrunk)(cachedMeta);
            handleRebase(branchName);
            return { result, branchName };
        },
        isMergedIntoTrunk: (branchName) => {
            assertBranch(branchName);
            assertBranch(trunkName);
            return (0, is_merged_1.isMerged)({ branchName, trunkName });
        },
        isBranchFixed,
        isBranchEmpty: (branchName) => {
            assertBranch(branchName);
            const cachedMeta = cache.branches[branchName];
            (0, cached_meta_1.assertCachedMetaIsValidAndNotTrunk)(cachedMeta);
            return (0, diff_1.isDiffEmpty)(branchName, cachedMeta.parentBranchRevision);
        },
        baseMatchesRemoteParent: (branchName) => {
            assertBranch(branchName);
            const cachedMeta = cache.branches[branchName];
            (0, cached_meta_1.assertCachedMetaIsValidAndNotTrunk)(cachedMeta);
            const remoteParentRevision = (0, get_sha_1.getRemoteSha)(cachedMeta.parentBranchName, remote);
            splog.debug(`${branchName} base matches remote?`);
            splog.debug(cachedMeta.parentBranchRevision);
            splog.debug(remoteParentRevision ?? '');
            return cachedMeta.parentBranchRevision === remoteParentRevision;
        },
        pushBranch: (branchName) => {
            assertBranch(branchName);
            const cachedMeta = cache.branches[branchName];
            (0, cached_meta_1.assertCachedMetaIsValidAndNotTrunk)(cachedMeta);
            (0, push_branch_1.pushBranch)({ remote, branchName, noVerify });
        },
        pullTrunk: () => {
            (0, prune_remote_1.pruneRemote)(remote);
            assertBranch(cache.currentBranch);
            const trunkName = assertTrunk();
            const oldTrunkCachedMeta = cache.branches[trunkName];
            try {
                (0, switch_branch_1.switchBranch)(trunkName);
                (0, pull_branch_1.pullBranch)(remote, trunkName);
                const newTrunkRevision = (0, get_sha_1.getShaOrThrow)(trunkName);
                cache.branches[trunkName] = {
                    ...oldTrunkCachedMeta,
                    branchRevision: newTrunkRevision,
                };
                return oldTrunkCachedMeta.branchRevision === newTrunkRevision
                    ? 'PULL_UNNEEDED'
                    : 'PULL_DONE';
            }
            finally {
                (0, switch_branch_1.switchBranch)(cache.currentBranch);
            }
        },
        fetchBranch: (branchName, parentBranchName) => {
            assertBranch(parentBranchName);
            const parentMeta = cache.branches[parentBranchName];
            (0, cached_meta_1.assertCachedMetaIsValidOrTrunk)(parentMeta);
            if (parentMeta.validationResult === 'TRUNK') {
                // If this is a trunk-child, its base is its merge base with trunk.
                (0, fetch_branch_1.fetchBranch)(remote, branchName);
                (0, fetch_branch_1.writeFetchBase)((0, merge_base_1.getMergeBase)((0, fetch_branch_1.readFetchHead)(), parentMeta.branchRevision));
            }
            else {
                // Otherwise, its base is the head of the previous fetch
                (0, fetch_branch_1.writeFetchBase)((0, fetch_branch_1.readFetchHead)());
                (0, fetch_branch_1.fetchBranch)(remote, branchName);
            }
        },
        branchMatchesFetched: (branchName) => {
            assertBranch(branchName);
            return cache.branches[branchName].branchRevision === (0, fetch_branch_1.readFetchHead)();
        },
        checkoutBranchFromFetched: (branchName, parentBranchName) => {
            const { head, base } = { head: (0, fetch_branch_1.readFetchHead)(), base: (0, fetch_branch_1.readFetchBase)() };
            (0, write_branch_1.forceCreateBranch)(branchName, head);
            (0, set_remote_tracking_1.setRemoteTracking)({ remote, branchName, sha: head });
            updateMeta(branchName, {
                validationResult: 'VALID',
                parentBranchName,
                parentBranchRevision: base,
                branchRevision: head,
                children: [],
            });
            cache.currentBranch = branchName;
        },
    };
}
exports.composeMetaCache = composeMetaCache;
//# sourceMappingURL=cache.js.map