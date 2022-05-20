"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Branch = void 0;
const child_process_1 = require("child_process");
const cache_1 = require("../lib/config/cache");
const errors_1 = require("../lib/errors");
const branch_ref_1 = require("../lib/git-refs/branch_ref");
const branch_relations_1 = require("../lib/git-refs/branch_relations");
const branch_exists_1 = require("../lib/utils/branch_exists");
const committer_date_1 = require("../lib/utils/committer_date");
const current_branch_name_1 = require("../lib/utils/current_branch_name");
const exec_sync_1 = require("../lib/utils/exec_sync");
const merge_base_1 = require("../lib/utils/merge_base");
const sorted_branch_names_1 = require("../lib/utils/sorted_branch_names");
const splog_1 = require("../lib/utils/splog");
const trunk_1 = require("../lib/utils/trunk");
const metadata_ref_1 = require("./metadata_ref");
class Branch {
    constructor(name, opts) {
        this.name = name;
        this.shouldUseMemoizedResults = (opts === null || opts === void 0 ? void 0 : opts.useMemoizedResults) || false;
    }
    static create(branchName, parentBranchName, parentBranchRevision) {
        const branch = new Branch(branchName);
        branch.writeMeta({ parentBranchName, parentBranchRevision });
    }
    /**
     * Uses memoized results for some of the branch calculations. Only turn this
     * on if the git tree should not change at all during the current invoked
     * command.
     */
    useMemoizedResults() {
        this.shouldUseMemoizedResults = true;
        return this;
    }
    toString() {
        return this.name;
    }
    stackByTracingMetaParents(context, branch) {
        const curBranch = branch || this;
        const metaParent = curBranch.getParentFromMeta(context);
        if (metaParent) {
            return this.stackByTracingMetaParents(context, metaParent).concat([
                curBranch.name,
            ]);
        }
        else {
            return [curBranch.name];
        }
    }
    stackByTracingGitParents(context, branch) {
        const curBranch = branch || this;
        const gitParents = curBranch.getParentsFromGit(context);
        if (gitParents.length === 1) {
            return this.stackByTracingGitParents(context, gitParents[0]).concat([
                curBranch.name,
            ]);
        }
        else {
            return [curBranch.name];
        }
    }
    getParentFromMeta(context) {
        var _a, _b;
        if (this.name === trunk_1.getTrunk(context).name) {
            return undefined;
        }
        let parentName = (_a = metadata_ref_1.MetadataRef.getMeta(this.name)) === null || _a === void 0 ? void 0 : _a.parentBranchName;
        if (!parentName) {
            return undefined;
        }
        // Cycle until we find a parent that has a real branch, or just is undefined.
        while (parentName && !branch_exists_1.branchExists(parentName)) {
            parentName = (_b = metadata_ref_1.MetadataRef.getMeta(parentName)) === null || _b === void 0 ? void 0 : _b.parentBranchName;
        }
        if (parentName) {
            this.setParentBranchName(parentName);
        }
        else {
            this.clearParentMetadata();
            return undefined;
        }
        if (parentName === this.name) {
            this.clearParentMetadata();
            throw new errors_1.ExitFailedError(`Branch (${this.name}) has itself listed as a parent in the meta. Deleting (${this.name}) parent metadata and exiting.`);
        }
        return new Branch(parentName);
    }
    static calculateMemoizedMetaChildren(context) {
        splog_1.logDebug(`Meta Children: initialize memoization | finding all branches...`);
        const metaChildren = {};
        const allBranches = Branch.allBranches(context, {
            useMemoizedResults: true,
        });
        splog_1.logDebug(`Meta Children: intiialize memoization | sifting through branches...`);
        allBranches.forEach((branch, i) => {
            splog_1.logDebug(`               Branch ${i}/${allBranches.length} (${branch.name})`);
            const parentBranchName = branch.getParentBranchName();
            if (parentBranchName === undefined) {
                return;
            }
            if (parentBranchName in metaChildren) {
                metaChildren[parentBranchName].push(branch);
            }
            else {
                metaChildren[parentBranchName] = [branch];
            }
        });
        splog_1.logDebug(`Meta Children: initialize memoization | done`);
        cache_1.cache.setMetaChildren(metaChildren);
        return metaChildren;
    }
    getChildrenFromMeta(context) {
        var _a, _b;
        splog_1.logDebug(`Meta Children (${this.name}): start`);
        if (!this.shouldUseMemoizedResults) {
            const children = Branch.allBranches(context).filter((b) => { var _a; return ((_a = metadata_ref_1.MetadataRef.getMeta(b.name)) === null || _a === void 0 ? void 0 : _a.parentBranchName) === this.name; });
            splog_1.logDebug(`Meta Children (${this.name}): end`);
            return children;
        }
        const memoizedMetaChildren = cache_1.cache.getMetaChildren();
        if (memoizedMetaChildren) {
            splog_1.logDebug(`Meta Children (${this.name}): end (memoized)`);
            return (_a = memoizedMetaChildren[this.name]) !== null && _a !== void 0 ? _a : [];
        }
        splog_1.logDebug(`Meta Children (${this.name}): end (recalculated)`);
        return (_b = Branch.calculateMemoizedMetaChildren(context)[this.name]) !== null && _b !== void 0 ? _b : [];
    }
    ref(context) {
        return branch_ref_1.getRef(this, context);
    }
    // TODO: Migrate to parentRevision with validation
    getMetaMergeBase(context) {
        const parent = this.getParentFromMeta(context);
        if (!parent) {
            return undefined;
        }
        const curParentMergeBase = merge_base_1.getMergeBase(parent.getCurrentRef(), this.name);
        const prevParentRef = parent.getMetaPrevRef();
        if (!prevParentRef) {
            return curParentMergeBase;
        }
        const prevParentMergeBase = merge_base_1.getMergeBase(prevParentRef, this.name);
        // The merge base of the two merge bases = the one closer to the trunk.
        // Therefore, the other must be closer or equal to the head of the branch.
        return merge_base_1.getMergeBase(prevParentMergeBase, curParentMergeBase) ===
            curParentMergeBase
            ? prevParentMergeBase
            : curParentMergeBase;
    }
    getMeta() {
        return metadata_ref_1.MetadataRef.getMeta(this.name);
    }
    writeMeta(meta) {
        metadata_ref_1.MetadataRef.updateOrCreate(this.name, meta);
    }
    getMetaPrevRef() {
        var _a;
        return (_a = metadata_ref_1.MetadataRef.getMeta(this.name)) === null || _a === void 0 ? void 0 : _a.prevRef;
    }
    getCurrentRef() {
        return child_process_1.execSync(`git rev-parse ${this.name}`).toString().trim();
    }
    clearMetadata() {
        this.writeMeta({});
        return this;
    }
    clearParentMetadata() {
        const meta = this.getMeta() || {};
        delete meta.parentBranchName;
        delete meta.parentBranchRevision;
        this.writeMeta(meta);
    }
    getParentBranchSha() {
        const meta = this.getMeta() || {};
        return meta.parentBranchRevision;
    }
    getParentBranchName() {
        const meta = this.getMeta() || {};
        return meta.parentBranchName;
    }
    setParentBranchName(parentBranchName) {
        const meta = this.getMeta() || {};
        meta.parentBranchName = parentBranchName;
        this.writeMeta(meta);
    }
    setParentBranch(parent) {
        const meta = this.getMeta() || {};
        meta.parentBranchName = parent.name;
        meta.parentBranchRevision = parent.getCurrentRef();
        this.writeMeta(meta);
    }
    savePrevRef() {
        const meta = this.getMeta() || {};
        meta.prevRef = this.getCurrentRef();
        this.writeMeta(meta);
    }
    lastCommitTime() {
        return parseInt(exec_sync_1.gpExecSync({ command: `git log -1 --format=%ct ${this.name} --` })
            .toString()
            .trim());
    }
    isTrunk(context) {
        return this.name === trunk_1.getTrunk(context).name;
    }
    static branchWithName(name) {
        if (!branch_exists_1.branchExists(name)) {
            throw new Error(`Failed to find branch named ${name}`);
        }
        return new Branch(name);
    }
    static currentBranch() {
        const name = current_branch_name_1.currentBranchName();
        // When the object we've checked out is a commit (and not a branch),
        // git rev-parse --abbrev-ref HEAD returns 'HEAD'. This isn't a valid
        // branch.
        return name ? new Branch(name) : undefined;
    }
    static allBranches(context, opts) {
        var _a;
        const branchNames = sorted_branch_names_1.sortedBranchNames();
        const maxDaysBehindTrunk = opts === null || opts === void 0 ? void 0 : opts.maxDaysBehindTrunk;
        let minUnixTimestamp = undefined;
        if (maxDaysBehindTrunk) {
            const trunkUnixTimestamp = parseInt(committer_date_1.getCommitterDate({
                revision: trunk_1.getTrunk(context).name,
                timeFormat: 'UNIX_TIMESTAMP',
            }));
            const secondsInDay = 24 * 60 * 60;
            minUnixTimestamp = trunkUnixTimestamp - maxDaysBehindTrunk * secondsInDay;
        }
        const maxBranches = opts === null || opts === void 0 ? void 0 : opts.maxBranches;
        const filteredBranches = [];
        for (const branchName of branchNames) {
            if (context.repoConfig.branchIsIgnored(branchName)) {
                continue;
            }
            if (filteredBranches.length === maxBranches) {
                break;
            }
            // If the current branch is older than the minimum time, we can
            // short-circuit the rest of the search as well - we gathered the
            // branches in descending chronological order.
            if (minUnixTimestamp !== undefined) {
                const committed = parseInt(committer_date_1.getCommitterDate({
                    revision: branchName,
                    timeFormat: 'UNIX_TIMESTAMP',
                }));
                if (committed < minUnixTimestamp) {
                    break;
                }
            }
            const branch = new Branch(branchName, {
                useMemoizedResults: (_a = opts === null || opts === void 0 ? void 0 : opts.useMemoizedResults) !== null && _a !== void 0 ? _a : false,
            });
            if (!(opts === null || opts === void 0 ? void 0 : opts.filter) || opts.filter(branch)) {
                filteredBranches.push(branch);
            }
        }
        return filteredBranches;
    }
    getChildrenFromGit(context) {
        splog_1.logDebug(`Git Children (${this.name}): start`);
        const kids = branch_relations_1.getBranchChildrenOrParentsFromGit(this, {
            direction: 'children',
            useMemoizedResults: this.shouldUseMemoizedResults,
        }, context);
        // In order to tacitly support those that use merge workflows, our logic
        // marks children it has visited - and short circuits - to avoid
        // duplication. This means that the ordering of children must be consistent
        // between git and meta to ensure that our views of their stacks always
        // align.
        splog_1.logDebug(`Git Children (${this.name}): end`);
        return kids.sort(this.sortBranchesAlphabetically);
    }
    sortBranchesAlphabetically(a, b) {
        if (a.name === b.name) {
            return 0;
        }
        else if (a.name < b.name) {
            return -1;
        }
        else {
            return 1;
        }
    }
    getParentsFromGit(context) {
        if (
        // Current branch is trunk
        this.name === trunk_1.getTrunk(context).name
        // Current branch shares
        ) {
            return [];
        }
        else if (this.pointsToSameCommitAs(trunk_1.getTrunk(context), context)) {
            return [trunk_1.getTrunk(context)];
        }
        // In order to tacitly support those that use merge workflows, our logic
        // marks children it has visited - and short circuits - to avoid
        // duplication. This means that the ordering of children must be consistent
        // between git and meta to ensure that our views of their stacks always
        // align.
        return branch_relations_1.getBranchChildrenOrParentsFromGit(this, {
            direction: 'parents',
            useMemoizedResults: this.shouldUseMemoizedResults,
        }, context).sort(this.sortBranchesAlphabetically);
    }
    pointsToSameCommitAs(branch, context) {
        return !!branch_ref_1.otherBranchesWithSameCommit(branch, context).find((b) => b.name === branch.name);
    }
    branchesWithSameCommit(context) {
        return branch_ref_1.otherBranchesWithSameCommit(this, context);
    }
    upsertPRInfo(prInfo) {
        const meta = this.getMeta() || {};
        meta.prInfo = Object.assign(Object.assign({}, meta.prInfo), prInfo);
        this.writeMeta(meta);
    }
    clearPRInfo() {
        const meta = this.getMeta() || {};
        delete meta.prInfo;
        this.writeMeta(meta);
    }
    getPRInfo() {
        var _a;
        return (_a = this.getMeta()) === null || _a === void 0 ? void 0 : _a.prInfo;
    }
    isBaseSameAsRemotePr(context) {
        var _a;
        const parent = this.getParentFromMeta(context);
        if (parent === undefined) {
            throw new errors_1.PreconditionsFailedError(`Could not find parent for branch ${this.name} to submit PR against. Please checkout ${this.name} and run \`gt upstack onto <parent_branch>\` to set its parent.`);
        }
        return parent.name !== ((_a = this.getPRInfo()) === null || _a === void 0 ? void 0 : _a.base);
    }
    // Due to deprecate in favor of other functions.
    getCommitSHAs(context) {
        // We rely on meta here as the source of truth to handle the case where
        // the user has just created a new branch, but hasn't added any commits
        // - so both branch tips point to the same commit. Graphite knows that
        // this is a parent-child relationship, but git does not.
        const parent = this.getParentFromMeta(context);
        if (parent === undefined) {
            return [];
        }
        const shas = new Set();
        const commits = exec_sync_1.gpExecSync({
            command: `git rev-list ${parent}..${this.name} --`,
        }, (_) => {
            // just soft-fail if we can't find the commits
            return Buffer.alloc(0);
        })
            .toString()
            .trim();
        if (commits.length === 0) {
            return [];
        }
        commits.split(/[\r\n]+/).forEach((sha) => {
            shas.add(sha);
        });
        return [...shas];
    }
}
exports.Branch = Branch;
//# sourceMappingURL=branch.js.map