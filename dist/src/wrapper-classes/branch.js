"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
const config_1 = require("../lib/config");
const errors_1 = require("../lib/errors");
const git_refs_1 = require("../lib/git-refs");
const utils_1 = require("../lib/utils");
const commit_1 = __importDefault(require("./commit"));
const metadata_ref_1 = __importDefault(require("./metadata_ref"));
let memoizedMetaChildren;
class Branch {
    constructor(name, opts) {
        this.name = name;
        this.shouldUseMemoizedResults = (opts === null || opts === void 0 ? void 0 : opts.useMemoizedResults) || false;
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
    stackByTracingMetaParents(branch) {
        const curBranch = branch || this;
        const metaParent = curBranch.getParentFromMeta();
        if (metaParent) {
            return this.stackByTracingMetaParents(metaParent).concat([
                curBranch.name,
            ]);
        }
        else {
            return [curBranch.name];
        }
    }
    stackByTracingGitParents(branch) {
        const curBranch = branch || this;
        const gitParents = curBranch.getParentsFromGit();
        if (gitParents.length === 1) {
            return this.stackByTracingGitParents(gitParents[0]).concat([
                curBranch.name,
            ]);
        }
        else {
            return [curBranch.name];
        }
    }
    getParentFromMeta() {
        var _a, _b;
        if (this.name === utils_1.getTrunk().name) {
            return undefined;
        }
        let parentName = (_a = metadata_ref_1.default.getMeta(this.name)) === null || _a === void 0 ? void 0 : _a.parentBranchName;
        if (!parentName) {
            return undefined;
        }
        // Cycle until we find a parent that has a real branch, or just is undefined.
        if (!Branch.exists(parentName)) {
            while (parentName && !Branch.exists(parentName)) {
                parentName = (_b = metadata_ref_1.default.getMeta(parentName)) === null || _b === void 0 ? void 0 : _b.parentBranchName;
            }
            if (parentName) {
                this.setParentBranchName(parentName);
            }
            else {
                this.clearParentMetadata();
                return undefined;
            }
        }
        if (parentName === this.name) {
            this.clearParentMetadata();
            throw new errors_1.ExitFailedError(`Branch (${this.name}) has itself listed as a parent in the meta. Deleting (${this.name}) parent metadata and exiting.`);
        }
        return new Branch(parentName);
    }
    getChildrenFromMeta() {
        var _a;
        utils_1.logDebug(`Meta Children (${this.name}): start`);
        if (this.shouldUseMemoizedResults) {
            if (memoizedMetaChildren === undefined) {
                utils_1.logDebug(`Meta Children (${this.name}): initialize memoization | finding all branches...`);
                const metaChildren = {};
                const allBranches = Branch.allBranches({
                    useMemoizedResults: this.shouldUseMemoizedResults,
                });
                utils_1.logDebug(`Meta Children: intiialize memoization | sifting through branches...`);
                allBranches.forEach((branch, i) => {
                    var _a;
                    utils_1.logDebug(`               Branch ${i}/${allBranches.length} (${branch.name})`);
                    const parentBranchName = (_a = metadata_ref_1.default.getMeta(branch.name)) === null || _a === void 0 ? void 0 : _a.parentBranchName;
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
                utils_1.logDebug(`Meta Children (${this.name}): initialize memoization | done`);
                memoizedMetaChildren = metaChildren;
            }
            utils_1.logDebug(`Meta Children (${this.name}): end (memoized)`);
            return (_a = memoizedMetaChildren[this.name]) !== null && _a !== void 0 ? _a : [];
        }
        const children = Branch.allBranches().filter((b) => { var _a; return ((_a = metadata_ref_1.default.getMeta(b.name)) === null || _a === void 0 ? void 0 : _a.parentBranchName) === this.name; });
        utils_1.logDebug(`Git Children (${this.name}): end`);
        return children;
    }
    isUpstreamOf(commitRef) {
        const downstreamRef = utils_1.gpExecSync({
            command: `git merge-base ${this.name} ${commitRef}`,
        })
            .toString()
            .trim();
        return downstreamRef !== this.ref();
    }
    ref() {
        return git_refs_1.getRef(this);
    }
    getMetaMergeBase() {
        const parent = this.getParentFromMeta();
        if (!parent) {
            return undefined;
        }
        const curParentRef = parent.getCurrentRef();
        const prevParentRef = parent.getMetaPrevRef();
        const curParentMergeBase = child_process_1.execSync(`git merge-base ${curParentRef} ${this.name}`)
            .toString()
            .trim();
        if (!prevParentRef) {
            return curParentMergeBase;
        }
        const prevParentMergeBase = child_process_1.execSync(`git merge-base ${prevParentRef} ${this.name}`)
            .toString()
            .trim();
        // The merge base of the two merge bases = the one closer to the trunk.
        // Therefore, the other must be closer or equal to the head of the branch.
        const closestMergeBase = child_process_1.execSync(`git merge-base ${prevParentMergeBase} ${curParentMergeBase}`)
            .toString()
            .trim() === curParentMergeBase
            ? prevParentMergeBase
            : curParentMergeBase;
        return closestMergeBase;
    }
    static exists(branchName) {
        try {
            child_process_1.execSync(`git show-ref --quiet refs/heads/${branchName}`, {
                stdio: 'ignore',
            });
        }
        catch (_a) {
            return false;
        }
        return true;
    }
    getMeta() {
        return metadata_ref_1.default.getMeta(this.name);
    }
    writeMeta(meta) {
        metadata_ref_1.default.updateOrCreate(this.name, meta);
    }
    getMetaPrevRef() {
        var _a;
        return (_a = metadata_ref_1.default.getMeta(this.name)) === null || _a === void 0 ? void 0 : _a.prevRef;
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
        this.writeMeta(meta);
    }
    setParentBranchName(parentBranchName) {
        const meta = this.getMeta() || {};
        meta.parentBranchName = parentBranchName;
        this.writeMeta(meta);
    }
    resetParentBranch() {
        const meta = this.getMeta() || {};
        meta.parentBranchName = undefined;
        this.writeMeta(meta);
    }
    setMetaPrevRef(prevRef) {
        const meta = this.getMeta() || {};
        meta.prevRef = prevRef;
        this.writeMeta(meta);
    }
    lastCommitTime() {
        return parseInt(utils_1.gpExecSync({ command: `git log -1 --format=%ct ${this.name} --` })
            .toString()
            .trim());
    }
    isTrunk() {
        return this.name === utils_1.getTrunk().name;
    }
    static branchWithName(name) {
        return __awaiter(this, void 0, void 0, function* () {
            const branch = Branch.allBranches().find((b) => b.name === name);
            if (!branch) {
                throw new Error(`Failed to find branch named ${name}`);
            }
            return new Branch(name);
        });
    }
    static getCurrentBranch() {
        const name = utils_1.gpExecSync({
            command: `git rev-parse --abbrev-ref HEAD`,
        }, (e) => {
            return Buffer.alloc(0);
        })
            .toString()
            .trim();
        // When the object we've checked out is a commit (and not a branch),
        // git rev-parse --abbrev-ref HEAD returns 'HEAD'. This isn't a valid
        // branch.
        return name.length > 0 && name !== 'HEAD' ? new Branch(name) : null;
    }
    static allBranchesImpl(opts) {
        const sortString = (opts === null || opts === void 0 ? void 0 : opts.sort) === undefined ? '' : `--sort='${opts === null || opts === void 0 ? void 0 : opts.sort}'`;
        return child_process_1.execSync(`git for-each-ref --format='%(refname:short)' ${sortString} refs/heads/`)
            .toString()
            .trim()
            .split('\n')
            .filter((name) => name.length > 0 && !config_1.repoConfig.branchIsIgnored(name))
            .map((name) => new Branch(name));
    }
    static allBranches(opts) {
        return Branch.allBranchesWithFilter({
            filter: () => true,
            opts: opts,
        });
    }
    static allBranchesWithFilter(args) {
        var _a, _b, _c, _d, _e;
        let branches = Branch.allBranchesImpl({
            sort: ((_a = args.opts) === null || _a === void 0 ? void 0 : _a.maxDaysBehindTrunk) !== undefined
                ? '-committerdate'
                : (_b = args.opts) === null || _b === void 0 ? void 0 : _b.sort,
        });
        if ((_c = args.opts) === null || _c === void 0 ? void 0 : _c.useMemoizedResults) {
            branches = branches.map((branch) => branch.useMemoizedResults());
        }
        const maxDaysBehindTrunk = (_d = args.opts) === null || _d === void 0 ? void 0 : _d.maxDaysBehindTrunk;
        let minUnixTimestamp = undefined;
        if (maxDaysBehindTrunk) {
            const trunkUnixTimestamp = parseInt(utils_1.getCommitterDate({
                revision: utils_1.getTrunk().name,
                timeFormat: 'UNIX_TIMESTAMP',
            }));
            const secondsInDay = 24 * 60 * 60;
            minUnixTimestamp = trunkUnixTimestamp - maxDaysBehindTrunk * secondsInDay;
        }
        const maxBranches = (_e = args.opts) === null || _e === void 0 ? void 0 : _e.maxBranches;
        const filteredBranches = [];
        for (let i = 0; i < branches.length; i++) {
            if (filteredBranches.length === maxBranches) {
                break;
            }
            // If the current branch is older than the minimum time, we can
            // short-circuit the rest of the search as well - we gathered the
            // branches in descending chronological order.
            if (minUnixTimestamp !== undefined) {
                const committed = parseInt(utils_1.getCommitterDate({
                    revision: branches[i].name,
                    timeFormat: 'UNIX_TIMESTAMP',
                }));
                if (committed < minUnixTimestamp) {
                    break;
                }
            }
            if (args.filter(branches[i])) {
                filteredBranches.push(branches[i]);
            }
        }
        return filteredBranches;
    }
    static getAllBranchesWithoutParents(opts) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.allBranchesWithFilter({
                filter: (branch) => {
                    if ((opts === null || opts === void 0 ? void 0 : opts.excludeTrunk) && branch.name === utils_1.getTrunk().name) {
                        return false;
                    }
                    return branch.getParentsFromGit().length === 0;
                },
                opts: opts,
            });
        });
    }
    static getAllBranchesWithParents(opts) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.allBranchesWithFilter({
                filter: (branch) => branch.getParentsFromGit().length > 0,
                opts: opts,
            });
        });
    }
    head() {
        return new commit_1.default(child_process_1.execSync(`git rev-parse ${this.name}`).toString().trim());
    }
    base() {
        var _a;
        const parentBranchName = (_a = this.getMeta()) === null || _a === void 0 ? void 0 : _a.parentBranchName;
        if (!parentBranchName) {
            return undefined;
        }
        return new commit_1.default(child_process_1.execSync(`git merge-base ${parentBranchName} ${this.name}`)
            .toString()
            .trim());
    }
    getChildrenFromGit() {
        utils_1.logDebug(`Git Children (${this.name}): start`);
        const kids = git_refs_1.getBranchChildrenOrParentsFromGit(this, {
            direction: 'children',
            useMemoizedResults: this.shouldUseMemoizedResults,
        });
        // In order to tacitly support those that use merge workflows, our logic
        // marks children it has visited - and short circuits - to avoid
        // duplication. This means that the ordering of children must be consistent
        // between git and meta to ensure that our views of their stacks always
        // align.
        utils_1.logDebug(`Git Children (${this.name}): end`);
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
    getParentsFromGit() {
        if (
        // Current branch is trunk
        this.name === utils_1.getTrunk().name
        // Current branch shares
        ) {
            return [];
        }
        else if (this.pointsToSameCommitAs(utils_1.getTrunk())) {
            return [utils_1.getTrunk()];
        }
        // In order to tacitly support those that use merge workflows, our logic
        // marks children it has visited - and short circuits - to avoid
        // duplication. This means that the ordering of children must be consistent
        // between git and meta to ensure that our views of their stacks always
        // align.
        return git_refs_1.getBranchChildrenOrParentsFromGit(this, {
            direction: 'parents',
            useMemoizedResults: this.shouldUseMemoizedResults,
        }).sort(this.sortBranchesAlphabetically);
    }
    pointsToSameCommitAs(branch) {
        return !!git_refs_1.otherBranchesWithSameCommit(branch).find((b) => b.name === branch.name);
    }
    branchesWithSameCommit() {
        return git_refs_1.otherBranchesWithSameCommit(this);
    }
    setPriorSubmitTitle(title) {
        const meta = this.getMeta() || {};
        meta.priorSubmitInfo = Object.assign(Object.assign({}, meta.priorSubmitInfo), { title: title });
        this.writeMeta(meta);
    }
    getPriorSubmitTitle() {
        var _a, _b;
        return (_b = (_a = this.getMeta()) === null || _a === void 0 ? void 0 : _a.priorSubmitInfo) === null || _b === void 0 ? void 0 : _b.title;
    }
    setPriorReviewers(reviewers) {
        const meta = this.getMeta() || {};
        meta.priorSubmitInfo = Object.assign(Object.assign({}, meta.priorSubmitInfo), { reviewers });
        this.writeMeta(meta);
    }
    getPriorReviewers() {
        var _a, _b;
        return (_b = (_a = this.getMeta()) === null || _a === void 0 ? void 0 : _a.priorSubmitInfo) === null || _b === void 0 ? void 0 : _b.reviewers;
    }
    setPriorSubmitBody(body) {
        const meta = this.getMeta() || {};
        meta.priorSubmitInfo = Object.assign(Object.assign({}, meta.priorSubmitInfo), { body: body });
        this.writeMeta(meta);
    }
    getPriorSubmitBody() {
        var _a, _b;
        return (_b = (_a = this.getMeta()) === null || _a === void 0 ? void 0 : _a.priorSubmitInfo) === null || _b === void 0 ? void 0 : _b.body;
    }
    setPRInfo(prInfo) {
        const meta = this.getMeta() || {};
        meta.prInfo = prInfo;
        this.writeMeta(meta);
    }
    clearPRInfo() {
        const meta = this.getMeta() || {};
        meta.prInfo = undefined;
        this.writeMeta(meta);
    }
    getPRInfo() {
        var _a;
        return (_a = this.getMeta()) === null || _a === void 0 ? void 0 : _a.prInfo;
    }
    isBaseSameAsRemotePr() {
        var _a;
        const parent = this.getParentFromMeta();
        if (parent === undefined) {
            throw new errors_1.PreconditionsFailedError(`Could not find parent for branch ${this.name} to submit PR against. Please checkout ${this.name} and run \`gt upstack onto <parent_branch>\` to set its parent.`);
        }
        return parent.name !== ((_a = this.getPRInfo()) === null || _a === void 0 ? void 0 : _a.base);
    }
    // Due to deprecate in favor of other functions.
    getCommitSHAs() {
        // We rely on meta here as the source of truth to handle the case where
        // the user has just created a new branch, but hasn't added any commits
        // - so both branch tips point to the same commit. Graphite knows that
        // this is a parent-child relationship, but git does not.
        const parent = this.getParentFromMeta();
        if (parent === undefined) {
            return [];
        }
        const shas = new Set();
        const commits = utils_1.gpExecSync({
            command: `git rev-list ${parent}..${this.name}`,
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
exports.default = Branch;
//# sourceMappingURL=branch.js.map