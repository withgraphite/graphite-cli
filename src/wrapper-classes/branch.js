"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
exports.__esModule = true;
var child_process_1 = require("child_process");
var config_1 = require("../lib/config");
var errors_1 = require("../lib/errors");
var git_refs_1 = require("../lib/git-refs");
var utils_1 = require("../lib/utils");
var commit_1 = require("./commit");
var metadata_ref_1 = require("./metadata_ref");
var memoizedMetaChildren;
var Branch = /** @class */ (function () {
    function Branch(name, opts) {
        this.name = name;
        this.shouldUseMemoizedResults = (opts === null || opts === void 0 ? void 0 : opts.useMemoizedResults) || false;
    }
    /**
     * Uses memoized results for some of the branch calculations. Only turn this
     * on if the git tree should not change at all during the current invoked
     * command.
     */
    Branch.prototype.useMemoizedResults = function () {
        this.shouldUseMemoizedResults = true;
        return this;
    };
    Branch.prototype.toString = function () {
        return this.name;
    };
    Branch.prototype.stackByTracingMetaParents = function (branch) {
        var curBranch = branch || this;
        var metaParent = curBranch.getParentFromMeta();
        if (metaParent) {
            return this.stackByTracingMetaParents(metaParent).concat([
                curBranch.name,
            ]);
        }
        else {
            return [curBranch.name];
        }
    };
    Branch.prototype.stackByTracingGitParents = function (branch) {
        var curBranch = branch || this;
        var gitParents = curBranch.getParentsFromGit();
        if (gitParents.length === 1) {
            return this.stackByTracingGitParents(gitParents[0]).concat([
                curBranch.name,
            ]);
        }
        else {
            return [curBranch.name];
        }
    };
    Branch.prototype.getParentFromMeta = function () {
        var _a, _b;
        if (this.name === utils_1.getTrunk().name) {
            return undefined;
        }
        var parentName = (_a = metadata_ref_1["default"].getMeta(this.name)) === null || _a === void 0 ? void 0 : _a.parentBranchName;
        if (!parentName) {
            return undefined;
        }
        // Cycle until we find a parent that has a real branch, or just is undefined.
        if (!Branch.exists(parentName)) {
            while (parentName && !Branch.exists(parentName)) {
                parentName = (_b = metadata_ref_1["default"].getMeta(parentName)) === null || _b === void 0 ? void 0 : _b.parentBranchName;
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
            throw new errors_1.ExitFailedError("Branch (" + this.name + ") has itself listed as a parent in the meta. Deleting (" + this.name + ") parent metadata and exiting.");
        }
        return new Branch(parentName);
    };
    Branch.prototype.getChildrenFromMeta = function () {
        var _this = this;
        var _a;
        utils_1.logDebug("Meta Children (" + this.name + "): start");
        if (this.shouldUseMemoizedResults) {
            if (memoizedMetaChildren === undefined) {
                utils_1.logDebug("Meta Children (" + this.name + "): initialize memoization | finding all branches...");
                var metaChildren_1 = {};
                var allBranches_1 = Branch.allBranches({
                    useMemoizedResults: this.shouldUseMemoizedResults
                });
                utils_1.logDebug("Meta Children: intiialize memoization | sifting through branches...");
                allBranches_1.forEach(function (branch, i) {
                    var _a;
                    utils_1.logDebug("               Branch " + i + "/" + allBranches_1.length + " (" + branch.name + ")");
                    var parentBranchName = (_a = metadata_ref_1["default"].getMeta(branch.name)) === null || _a === void 0 ? void 0 : _a.parentBranchName;
                    if (parentBranchName === undefined) {
                        return;
                    }
                    if (parentBranchName in metaChildren_1) {
                        metaChildren_1[parentBranchName].push(branch);
                    }
                    else {
                        metaChildren_1[parentBranchName] = [branch];
                    }
                });
                utils_1.logDebug("Meta Children (" + this.name + "): initialize memoization | done");
                memoizedMetaChildren = metaChildren_1;
            }
            utils_1.logDebug("Meta Children (" + this.name + "): end (memoized)");
            return (_a = memoizedMetaChildren[this.name]) !== null && _a !== void 0 ? _a : [];
        }
        var children = Branch.allBranches().filter(function (b) { var _a; return ((_a = metadata_ref_1["default"].getMeta(b.name)) === null || _a === void 0 ? void 0 : _a.parentBranchName) === _this.name; });
        utils_1.logDebug("Git Children (" + this.name + "): end");
        return children;
    };
    Branch.prototype.isUpstreamOf = function (commitRef) {
        var downstreamRef = utils_1.gpExecSync({
            command: "git merge-base " + this.name + " " + commitRef
        })
            .toString()
            .trim();
        return downstreamRef !== this.ref();
    };
    Branch.prototype.ref = function () {
        return git_refs_1.getRef(this);
    };
    Branch.prototype.getMetaMergeBase = function () {
        var parent = this.getParentFromMeta();
        if (!parent) {
            return undefined;
        }
        var curParentRef = parent.getCurrentRef();
        var prevParentRef = parent.getMetaPrevRef();
        var curParentMergeBase = child_process_1.execSync("git merge-base " + curParentRef + " " + this.name)
            .toString()
            .trim();
        if (!prevParentRef) {
            return curParentMergeBase;
        }
        var prevParentMergeBase = child_process_1.execSync("git merge-base " + prevParentRef + " " + this.name)
            .toString()
            .trim();
        // The merge base of the two merge bases = the one closer to the trunk.
        // Therefore, the other must be closer or equal to the head of the branch.
        var closestMergeBase = child_process_1.execSync("git merge-base " + prevParentMergeBase + " " + curParentMergeBase)
            .toString()
            .trim() === curParentMergeBase
            ? prevParentMergeBase
            : curParentMergeBase;
        return closestMergeBase;
    };
    Branch.exists = function (branchName) {
        try {
            child_process_1.execSync("git show-ref --quiet refs/heads/" + branchName, {
                stdio: 'ignore'
            });
        }
        catch (_a) {
            return false;
        }
        return true;
    };
    Branch.prototype.getMeta = function () {
        return metadata_ref_1["default"].getMeta(this.name);
    };
    Branch.prototype.writeMeta = function (meta) {
        metadata_ref_1["default"].updateOrCreate(this.name, meta);
    };
    Branch.prototype.getMetaPrevRef = function () {
        var _a;
        return (_a = metadata_ref_1["default"].getMeta(this.name)) === null || _a === void 0 ? void 0 : _a.prevRef;
    };
    Branch.prototype.getCurrentRef = function () {
        return child_process_1.execSync("git rev-parse " + this.name).toString().trim();
    };
    Branch.prototype.clearMetadata = function () {
        this.writeMeta({});
        return this;
    };
    Branch.prototype.clearParentMetadata = function () {
        var meta = this.getMeta() || {};
        delete meta.parentBranchName;
        this.writeMeta(meta);
    };
    Branch.prototype.setParentBranchName = function (parentBranchName) {
        var meta = this.getMeta() || {};
        meta.parentBranchName = parentBranchName;
        this.writeMeta(meta);
    };
    Branch.prototype.resetParentBranch = function () {
        var meta = this.getMeta() || {};
        meta.parentBranchName = undefined;
        this.writeMeta(meta);
    };
    Branch.prototype.setMetaPrevRef = function (prevRef) {
        var meta = this.getMeta() || {};
        meta.prevRef = prevRef;
        this.writeMeta(meta);
    };
    Branch.prototype.lastCommitTime = function () {
        return parseInt(utils_1.gpExecSync({ command: "git log -1 --format=%ct " + this.name + " --" })
            .toString()
            .trim());
    };
    Branch.prototype.isTrunk = function () {
        return this.name === utils_1.getTrunk().name;
    };
    Branch.branchWithName = function (name) {
        return __awaiter(this, void 0, void 0, function () {
            var branch;
            return __generator(this, function (_a) {
                branch = Branch.allBranches().find(function (b) { return b.name === name; });
                if (!branch) {
                    throw new Error("Failed to find branch named " + name);
                }
                return [2 /*return*/, new Branch(name)];
            });
        });
    };
    Branch.getCurrentBranch = function () {
        var name = utils_1.gpExecSync({
            command: "git rev-parse --abbrev-ref HEAD"
        }, function (e) {
            return Buffer.alloc(0);
        })
            .toString()
            .trim();
        // When the object we've checked out is a commit (and not a branch),
        // git rev-parse --abbrev-ref HEAD returns 'HEAD'. This isn't a valid
        // branch.
        return name.length > 0 && name !== 'HEAD' ? new Branch(name) : null;
    };
    Branch.allBranchesImpl = function (opts) {
        var sortString = (opts === null || opts === void 0 ? void 0 : opts.sort) === undefined ? '' : "--sort='" + (opts === null || opts === void 0 ? void 0 : opts.sort) + "'";
        return child_process_1.execSync("git for-each-ref --format='%(refname:short)' " + sortString + " refs/heads/")
            .toString()
            .trim()
            .split('\n')
            .filter(function (name) { return name.length > 0 && !config_1.repoConfig.branchIsIgnored(name); })
            .map(function (name) { return new Branch(name); });
    };
    Branch.allBranches = function (opts) {
        return Branch.allBranchesWithFilter({
            filter: function () { return true; },
            opts: opts
        });
    };
    Branch.allBranchesWithFilter = function (args) {
        var _a, _b, _c, _d, _e;
        var branches = Branch.allBranchesImpl({
            sort: ((_a = args.opts) === null || _a === void 0 ? void 0 : _a.maxDaysBehindTrunk) !== undefined
                ? '-committerdate'
                : (_b = args.opts) === null || _b === void 0 ? void 0 : _b.sort
        });
        if ((_c = args.opts) === null || _c === void 0 ? void 0 : _c.useMemoizedResults) {
            branches = branches.map(function (branch) { return branch.useMemoizedResults(); });
        }
        var maxDaysBehindTrunk = (_d = args.opts) === null || _d === void 0 ? void 0 : _d.maxDaysBehindTrunk;
        var minUnixTimestamp = undefined;
        if (maxDaysBehindTrunk) {
            var trunkUnixTimestamp = parseInt(utils_1.getCommitterDate({
                revision: utils_1.getTrunk().name,
                timeFormat: 'UNIX_TIMESTAMP'
            }));
            var secondsInDay = 24 * 60 * 60;
            minUnixTimestamp = trunkUnixTimestamp - maxDaysBehindTrunk * secondsInDay;
        }
        var maxBranches = (_e = args.opts) === null || _e === void 0 ? void 0 : _e.maxBranches;
        var filteredBranches = [];
        for (var i = 0; i < branches.length; i++) {
            if (filteredBranches.length === maxBranches) {
                break;
            }
            // If the current branch is older than the minimum time, we can
            // short-circuit the rest of the search as well - we gathered the
            // branches in descending chronological order.
            if (minUnixTimestamp !== undefined) {
                var committed = parseInt(utils_1.getCommitterDate({
                    revision: branches[i].name,
                    timeFormat: 'UNIX_TIMESTAMP'
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
    };
    Branch.getAllBranchesWithoutParents = function (opts) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.allBranchesWithFilter({
                        filter: function (branch) {
                            if ((opts === null || opts === void 0 ? void 0 : opts.excludeTrunk) && branch.name === utils_1.getTrunk().name) {
                                return false;
                            }
                            return branch.getParentsFromGit().length === 0;
                        },
                        opts: opts
                    })];
            });
        });
    };
    Branch.getAllBranchesWithParents = function (opts) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.allBranchesWithFilter({
                        filter: function (branch) { return branch.getParentsFromGit().length > 0; },
                        opts: opts
                    })];
            });
        });
    };
    Branch.prototype.head = function () {
        return new commit_1["default"](child_process_1.execSync("git rev-parse " + this.name).toString().trim());
    };
    Branch.prototype.base = function () {
        var _a;
        var parentBranchName = (_a = this.getMeta()) === null || _a === void 0 ? void 0 : _a.parentBranchName;
        if (!parentBranchName) {
            return undefined;
        }
        return new commit_1["default"](child_process_1.execSync("git merge-base " + parentBranchName + " " + this.name)
            .toString()
            .trim());
    };
    Branch.prototype.getChildrenFromGit = function () {
        utils_1.logDebug("Git Children (" + this.name + "): start");
        var kids = git_refs_1.getBranchChildrenOrParentsFromGit(this, {
            direction: 'children',
            useMemoizedResults: this.shouldUseMemoizedResults
        });
        // In order to tacitly support those that use merge workflows, our logic
        // marks children it has visited - and short circuits - to avoid
        // duplication. This means that the ordering of children must be consistent
        // between git and meta to ensure that our views of their stacks always
        // align.
        utils_1.logDebug("Git Children (" + this.name + "): end");
        return kids.sort(this.sortBranchesAlphabetically);
    };
    Branch.prototype.sortBranchesAlphabetically = function (a, b) {
        if (a.name === b.name) {
            return 0;
        }
        else if (a.name < b.name) {
            return -1;
        }
        else {
            return 1;
        }
    };
    Branch.prototype.getParentsFromGit = function () {
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
            useMemoizedResults: this.shouldUseMemoizedResults
        }).sort(this.sortBranchesAlphabetically);
    };
    Branch.prototype.pointsToSameCommitAs = function (branch) {
        return !!git_refs_1.otherBranchesWithSameCommit(branch).find(function (b) { return b.name === branch.name; });
    };
    Branch.prototype.branchesWithSameCommit = function () {
        return git_refs_1.otherBranchesWithSameCommit(this);
    };
    Branch.prototype.setPriorSubmitTitle = function (title) {
        var meta = this.getMeta() || {};
        meta.priorSubmitInfo = __assign(__assign({}, meta.priorSubmitInfo), { title: title });
        this.writeMeta(meta);
    };
    Branch.prototype.getPriorSubmitTitle = function () {
        var _a, _b;
        return (_b = (_a = this.getMeta()) === null || _a === void 0 ? void 0 : _a.priorSubmitInfo) === null || _b === void 0 ? void 0 : _b.title;
    };
    Branch.prototype.setPriorReviewers = function (reviewers) {
        var meta = this.getMeta() || {};
        meta.priorSubmitInfo = __assign(__assign({}, meta.priorSubmitInfo), { reviewers: reviewers });
        this.writeMeta(meta);
    };
    Branch.prototype.getPriorReviewers = function () {
        var _a, _b;
        return (_b = (_a = this.getMeta()) === null || _a === void 0 ? void 0 : _a.priorSubmitInfo) === null || _b === void 0 ? void 0 : _b.reviewers;
    };
    Branch.prototype.setPriorSubmitBody = function (body) {
        var meta = this.getMeta() || {};
        meta.priorSubmitInfo = __assign(__assign({}, meta.priorSubmitInfo), { body: body });
        this.writeMeta(meta);
    };
    Branch.prototype.getPriorSubmitBody = function () {
        var _a, _b;
        return (_b = (_a = this.getMeta()) === null || _a === void 0 ? void 0 : _a.priorSubmitInfo) === null || _b === void 0 ? void 0 : _b.body;
    };
    Branch.prototype.setPRInfo = function (prInfo) {
        var meta = this.getMeta() || {};
        meta.prInfo = prInfo;
        this.writeMeta(meta);
    };
    Branch.prototype.clearPRInfo = function () {
        var meta = this.getMeta() || {};
        meta.prInfo = undefined;
        this.writeMeta(meta);
    };
    Branch.prototype.getPRInfo = function () {
        var _a;
        return (_a = this.getMeta()) === null || _a === void 0 ? void 0 : _a.prInfo;
    };
    Branch.prototype.isBaseSameAsRemotePr = function () {
        var _a;
        var parent = this.getParentFromMeta();
        if (parent === undefined) {
            throw new errors_1.PreconditionsFailedError("Could not find parent for branch " + this.name + " to submit PR against. Please checkout " + this.name + " and run `gt upstack onto <parent_branch>` to set its parent.");
        }
        return parent.name !== ((_a = this.getPRInfo()) === null || _a === void 0 ? void 0 : _a.base);
    };
    // Due to deprecate in favor of other functions.
    Branch.prototype.getCommitSHAs = function () {
        // We rely on meta here as the source of truth to handle the case where
        // the user has just created a new branch, but hasn't added any commits
        // - so both branch tips point to the same commit. Graphite knows that
        // this is a parent-child relationship, but git does not.
        var parent = this.getParentFromMeta();
        if (parent === undefined) {
            return [];
        }
        var shas = new Set();
        var commits = utils_1.gpExecSync({
            command: "git rev-list " + parent + ".." + this.name
        }, function (_) {
            // just soft-fail if we can't find the commits
            return Buffer.alloc(0);
        })
            .toString()
            .trim();
        if (commits.length === 0) {
            return [];
        }
        commits.split(/[\r\n]+/).forEach(function (sha) {
            shas.add(sha);
        });
        return __spreadArrays(shas);
    };
    return Branch;
}());
exports["default"] = Branch;
