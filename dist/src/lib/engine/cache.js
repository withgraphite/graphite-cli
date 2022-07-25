"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.composeMetaCache = void 0;
const chalk_1 = __importDefault(require("chalk"));
const errors_1 = require("../errors");
const branch_ops_1 = require("../git/branch_ops");
const commit_1 = require("../git/commit");
const commit_range_1 = require("../git/commit_range");
const diff_1 = require("../git/diff");
const fetch_branch_1 = require("../git/fetch_branch");
const get_sha_1 = require("../git/get_sha");
const is_merged_1 = require("../git/is_merged");
const merge_base_1 = require("../git/merge_base");
const prune_remote_1 = require("../git/prune_remote");
const pull_branch_1 = require("../git/pull_branch");
const push_branch_1 = require("../git/push_branch");
const rebase_1 = require("../git/rebase");
const reset_branch_1 = require("../git/reset_branch");
const set_remote_tracking_1 = require("../git/set_remote_tracking");
const cute_string_1 = require("../utils/cute_string");
const cached_meta_1 = require("./cached_meta");
const cache_loader_1 = require("./cache_loader");
const metadata_ref_1 = require("./metadata_ref");
const parse_branches_and_meta_1 = require("./parse_branches_and_meta");
// eslint-disable-next-line max-lines-per-function
function composeMetaCache({ trunkName, currentBranchOverride, splog, noVerify, remote, restackCommitterDateIsAuthorDate, }) {
    const cacheLoader = (0, cache_loader_1.composeCacheLoader)(splog);
    void cacheLoader;
    const cache = {
        currentBranch: currentBranchOverride ?? (0, branch_ops_1.getCurrentBranchName)(),
        branches: cacheLoader.loadCachedBranches(trunkName),
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
    const isDescendantOf = (branchName, parentBranchName) => {
        assertBranch(branchName);
        assertBranch(parentBranchName);
        return (branchName !== parentBranchName &&
            (0, merge_base_1.getMergeBase)(branchName, parentBranchName) ===
                cache.branches[parentBranchName].branchRevision);
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
    const validateNewParent = (branchName, parentBranchName) => {
        if (branchName === parentBranchName) {
            throw new errors_1.PreconditionsFailedError(`Cannot set parent of ${chalk_1.default.yellow(branchName)} to itself!`);
        }
        if (branchName in cache.branches &&
            getRecursiveChildren(branchName).includes(parentBranchName)) {
            throw new errors_1.PreconditionsFailedError(`Cannot set parent of ${chalk_1.default.yellow(branchName)} to ${chalk_1.default.yellow(parentBranchName)}!`);
        }
    };
    const setParent = (branchName, parentBranchName) => {
        validateNewParent(branchName, parentBranchName);
        const cachedMeta = cache.branches[branchName];
        (0, cached_meta_1.assertCachedMetaIsValidAndNotTrunk)(cachedMeta);
        const oldParentBranchName = cachedMeta.parentBranchName;
        if (oldParentBranchName === parentBranchName) {
            return;
        }
        assertBranch(parentBranchName);
        const parentCachedMeta = cache.branches[parentBranchName];
        (0, cached_meta_1.assertCachedMetaIsValidOrTrunk)(parentCachedMeta);
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
        (0, branch_ops_1.switchBranch)(branchName);
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
        }
        if (!cache.branches[newParentBranchName].children.includes(branchName)) {
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
    const deleteAllBranchData = (branchName) => {
        assertBranch(branchName);
        const cachedMeta = cache.branches[branchName];
        (0, cached_meta_1.assertCachedMetaIsValidAndNotTrunk)(cachedMeta);
        removeChild(cachedMeta.parentBranchName, branchName);
        delete cache.branches[branchName];
        (0, branch_ops_1.deleteBranch)(branchName);
        (0, metadata_ref_1.deleteMetadataRef)(branchName);
    };
    const handleSuccessfulRebase = (branchName, parentBranchRevision) => {
        const cachedMeta = cache.branches[branchName];
        (0, cached_meta_1.assertCachedMetaIsValidAndNotTrunk)(cachedMeta);
        updateMeta(branchName, {
            ...cachedMeta,
            branchRevision: (0, get_sha_1.getShaOrThrow)(branchName),
            parentBranchRevision,
        });
        if (cache.currentBranch && cache.currentBranch in cache.branches) {
            (0, branch_ops_1.switchBranch)(cache.currentBranch);
        }
    };
    return {
        get debug() {
            return (0, cute_string_1.cuteString)(cache);
        },
        persist() {
            cacheLoader.persistCache(trunkName, cache.branches);
        },
        clear() {
            cacheLoader.clearPersistedCache();
        },
        reset(newTrunkName) {
            trunkName = newTrunkName ?? trunkName;
            Object.keys((0, metadata_ref_1.getMetadataRefList)()).forEach((branchName) => (0, metadata_ref_1.deleteMetadataRef)(branchName));
            cache.branches = cacheLoader.loadCachedBranches(trunkName);
        },
        rebuild(newTrunkName) {
            trunkName = newTrunkName ?? trunkName;
            cache.branches = cacheLoader.loadCachedBranches(trunkName);
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
        isDescendantOf: isDescendantOf,
        trackBranch: (branchName, parentBranchName) => {
            validateNewParent(branchName, parentBranchName);
            assertBranch(branchName);
            assertBranch(parentBranchName);
            (0, cached_meta_1.assertCachedMetaIsValidOrTrunk)(cache.branches[parentBranchName]);
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
            (0, cached_meta_1.assertCachedMetaIsValidOrTrunk)(meta);
            return (0, commit_range_1.getCommitRange)(
            // for trunk, commit range is just one commit
            meta.validationResult === 'TRUNK'
                ? undefined
                : meta.parentBranchRevision, meta.branchRevision, format);
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
        clearPrInfo: (branchName) => {
            const meta = cache.branches[branchName];
            if (meta?.validationResult !== 'VALID') {
                return;
            }
            updateMeta(branchName, {
                ...meta,
                prInfo: {},
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
            validateNewParent(branchName, parentBranchName);
            (0, branch_ops_1.switchBranch)(branchName, { new: true });
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
            if (branchName === cache.currentBranch) {
                return;
            }
            const cachedMeta = cache.branches[cache.currentBranch];
            (0, cached_meta_1.assertCachedMetaIsValidAndNotTrunk)(cachedMeta);
            (0, branch_ops_1.moveBranch)(branchName);
            updateMeta(branchName, { ...cachedMeta, prInfo: {} });
            cachedMeta.children.forEach((childBranchName) => setParent(childBranchName, branchName));
            removeChild(cachedMeta.parentBranchName, cache.currentBranch);
            delete cache.branches[cache.currentBranch];
            (0, metadata_ref_1.deleteMetadataRef)(cache.currentBranch);
            cache.currentBranch = branchName;
        },
        foldCurrentBranch: (keep) => {
            const currentBranchName = cache.currentBranch;
            assertBranch(currentBranchName);
            const cachedMeta = cache.branches[currentBranchName];
            (0, cached_meta_1.assertCachedMetaIsValidAndNotTrunk)(cachedMeta);
            const parentBranchName = cachedMeta.parentBranchName;
            const parentCachedMeta = cache.branches[parentBranchName];
            (0, cached_meta_1.assertCachedMetaIsValidAndNotTrunk)(parentCachedMeta);
            if (keep) {
                updateMeta(currentBranchName, {
                    ...cachedMeta,
                    parentBranchName: parentCachedMeta.parentBranchName,
                    parentBranchRevision: parentCachedMeta.parentBranchRevision,
                });
                parentCachedMeta.children
                    .filter((childBranchName) => childBranchName !== currentBranchName)
                    .forEach((childBranchName) => setParent(childBranchName, currentBranchName));
                deleteAllBranchData(parentBranchName);
            }
            else {
                (0, branch_ops_1.forceCheckoutNewBranch)(parentBranchName, cachedMeta.branchRevision);
                updateMeta(parentBranchName, {
                    ...parentCachedMeta,
                    branchRevision: cachedMeta.branchRevision,
                });
                cachedMeta.children.forEach((childBranchName) => setParent(childBranchName, parentBranchName));
                checkoutBranch(cachedMeta.parentBranchName);
                deleteAllBranchData(currentBranchName);
            }
        },
        deleteBranch: (branchName) => {
            assertBranch(branchName);
            const cachedMeta = cache.branches[branchName];
            (0, cached_meta_1.assertCachedMetaIsValidAndNotTrunk)(cachedMeta);
            if (branchName === cache.currentBranch) {
                checkoutBranch(cachedMeta.parentBranchName);
            }
            cachedMeta.children.forEach((childBranchName) => setParent(childBranchName, cachedMeta.parentBranchName));
            deleteAllBranchData(branchName);
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
        squashCurrentBranch: (opts) => {
            assertBranch(cache.currentBranch);
            const cachedMeta = cache.branches[cache.currentBranch];
            (0, cached_meta_1.assertCachedMetaIsValidAndNotTrunk)(cachedMeta);
            (0, reset_branch_1.softReset)((0, commit_range_1.getCommitRange)(cachedMeta.parentBranchRevision, cachedMeta.branchRevision, 'SHA').reverse()[0]);
            (0, commit_1.commit)({
                ...opts,
                amend: true,
                noVerify,
                rollbackOnError: () => {
                    (0, reset_branch_1.softReset)(cachedMeta.branchRevision);
                },
            });
            cache.branches[cache.currentBranch] = {
                ...cachedMeta,
                branchRevision: (0, get_sha_1.getShaOrThrow)(cache.currentBranch),
            };
        },
        detach() {
            const branchName = cache.currentBranch;
            assertBranch(branchName);
            const cachedMeta = cache.branches[branchName];
            (0, cached_meta_1.assertCachedMetaIsValidAndNotTrunk)(cachedMeta);
            (0, branch_ops_1.switchBranch)(cachedMeta.branchRevision, { detach: true });
        },
        detachAndResetBranchChanges() {
            const branchName = cache.currentBranch;
            assertBranch(branchName);
            const cachedMeta = cache.branches[branchName];
            (0, cached_meta_1.assertCachedMetaIsValidAndNotTrunk)(cachedMeta);
            (0, branch_ops_1.switchBranch)(cachedMeta.branchRevision, { detach: true });
            (0, reset_branch_1.trackedReset)(cachedMeta.parentBranchRevision);
        },
        applySplitToCommits({ branchToSplit, branchNames, branchPoints, }) {
            if (branchNames.length !== branchPoints.length) {
                splog.debug(branchNames.toString());
                splog.debug(branchPoints.toString());
                throw new errors_1.PreconditionsFailedError(`Invalid number of branch names.`);
            }
            assertBranch(branchToSplit);
            const cachedMeta = cache.branches[branchToSplit];
            (0, cached_meta_1.assertCachedMetaIsValidAndNotTrunk)(cachedMeta);
            // we reverse the branch points because they are referencing
            // commits from newest to oldest, but we name branches from
            // oldest to newest (parent to child)
            const reversedBranchPoints = branchPoints.slice().reverse();
            // keep track of the last branch's name + SHA for metadata
            const lastBranch = {
                name: cachedMeta.parentBranchName,
                revision: cachedMeta.parentBranchRevision,
            };
            branchNames.forEach((branchName, idx) => {
                const branchRevision = (0, get_sha_1.getShaOrThrow)(`@~${reversedBranchPoints[idx]}`);
                (0, branch_ops_1.forceCreateBranch)(branchName, branchRevision);
                updateMeta(branchName, {
                    validationResult: 'VALID',
                    branchRevision,
                    parentBranchName: lastBranch.name,
                    parentBranchRevision: lastBranch.revision,
                    children: [],
                    prInfo: branchName === branchToSplit ? cachedMeta.prInfo : undefined,
                });
                lastBranch.name = branchName;
                lastBranch.revision = branchRevision;
            });
            cachedMeta.children.forEach((childBranchName) => setParent(childBranchName, lastBranch.name));
            if (!branchNames.includes(branchToSplit)) {
                deleteAllBranchData(branchToSplit);
            }
            cache.currentBranch = lastBranch.name;
            (0, branch_ops_1.switchBranch)(lastBranch.name);
        },
        forceCheckoutBranch: (branchToSplit) => {
            (0, branch_ops_1.switchBranch)(branchToSplit, { force: true });
        },
        restackBranch: (branchName) => {
            assertBranch(branchName);
            const cachedMeta = cache.branches[branchName];
            (0, cached_meta_1.assertCachedMetaIsValidOrTrunk)(cachedMeta);
            if (isBranchFixed(branchName)) {
                return { result: 'REBASE_UNNEEDED' };
            }
            (0, cached_meta_1.assertCachedMetaIsNotTrunk)(cachedMeta);
            assertBranch(cachedMeta.parentBranchName);
            const newBase = cache.branches[cachedMeta.parentBranchName].branchRevision;
            if ((0, rebase_1.rebase)({
                branchName,
                onto: cachedMeta.parentBranchName,
                from: cachedMeta.parentBranchRevision,
                restackCommitterDateIsAuthorDate,
            }) === 'REBASE_CONFLICT') {
                return {
                    result: 'REBASE_CONFLICT',
                    rebasedBranchBase: newBase,
                };
            }
            handleSuccessfulRebase(branchName, newBase);
            return { result: 'REBASE_DONE' };
        },
        rebaseInteractive: (branchName) => {
            assertBranch(branchName);
            const cachedMeta = cache.branches[branchName];
            (0, cached_meta_1.assertCachedMetaIsValidAndNotTrunk)(cachedMeta);
            if ((0, rebase_1.rebaseInteractive)({
                branchName,
                parentBranchRevision: cachedMeta.parentBranchRevision,
            }) === 'REBASE_CONFLICT') {
                return {
                    result: 'REBASE_CONFLICT',
                    rebasedBranchBase: cachedMeta.parentBranchRevision,
                };
            }
            handleSuccessfulRebase(branchName, cachedMeta.parentBranchRevision);
            return { result: 'REBASE_DONE' };
        },
        continueRebase: (parentBranchRevision) => {
            const result = (0, rebase_1.rebaseContinue)();
            if (result === 'REBASE_CONFLICT') {
                return { result };
            }
            const branchName = (0, branch_ops_1.getCurrentBranchName)();
            assertBranch(branchName);
            const cachedMeta = cache.branches[branchName];
            (0, cached_meta_1.assertCachedMetaIsValidAndNotTrunk)(cachedMeta);
            handleSuccessfulRebase(branchName, parentBranchRevision);
            return { result, branchName };
        },
        abortRebase: () => {
            (0, rebase_1.rebaseAbort)();
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
        pushBranch: (branchName, forcePush) => {
            assertBranch(branchName);
            const cachedMeta = cache.branches[branchName];
            (0, cached_meta_1.assertCachedMetaIsValidAndNotTrunk)(cachedMeta);
            (0, push_branch_1.pushBranch)({ remote, branchName, noVerify, forcePush });
        },
        pullTrunk: () => {
            (0, prune_remote_1.pruneRemote)(remote);
            assertBranch(cache.currentBranch);
            const trunkName = assertTrunk();
            const oldTrunkCachedMeta = cache.branches[trunkName];
            try {
                (0, branch_ops_1.switchBranch)(trunkName);
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
                (0, branch_ops_1.switchBranch)(cache.currentBranch);
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
            validateNewParent(branchName, parentBranchName);
            assertBranch(parentBranchName);
            const { head, base } = { head: (0, fetch_branch_1.readFetchHead)(), base: (0, fetch_branch_1.readFetchBase)() };
            (0, branch_ops_1.forceCheckoutNewBranch)(branchName, head);
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
        rebaseBranchOntoFetched: (branchName, parentBranchName) => {
            assertBranch(branchName);
            assertBranch(parentBranchName);
            const cachedMeta = cache.branches[branchName];
            (0, cached_meta_1.assertCachedMetaIsValidAndNotTrunk)(cachedMeta);
            const { head, base } = { head: (0, fetch_branch_1.readFetchHead)(), base: (0, fetch_branch_1.readFetchBase)() };
            (0, set_remote_tracking_1.setRemoteTracking)({ remote, branchName, sha: head });
            // setting the current branch to this branch is correct in either case
            // failure case, we want it so that currentBranchOverride will be set
            // success case, it ends up as HEAD after the rebase.
            cache.currentBranch = branchName;
            if ((0, rebase_1.rebase)({
                onto: head,
                from: cachedMeta.parentBranchRevision,
                branchName,
                restackCommitterDateIsAuthorDate,
            }) === 'REBASE_CONFLICT') {
                return {
                    result: 'REBASE_CONFLICT',
                    rebasedBranchBase: base,
                };
            }
            handleSuccessfulRebase(branchName, base);
            return { result: 'REBASE_DONE' };
        },
    };
}
exports.composeMetaCache = composeMetaCache;
//# sourceMappingURL=cache.js.map