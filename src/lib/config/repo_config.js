"use strict";
exports.__esModule = true;
exports.getOwnerAndNameFromURLForTesting = void 0;
var chalk_1 = require("chalk");
var fs_extra_1 = require("fs-extra");
var path_1 = require("path");
var micromatch_1 = require("micromatch");
var errors_1 = require("../errors");
var utils_1 = require("../utils");
var repo_root_path_1 = require("./repo_root_path");
var CONFIG_NAME = '.graphite_repo_config';
var CURRENT_REPO_CONFIG_PATH = path_1["default"].join(repo_root_path_1.getRepoRootPath(), CONFIG_NAME);
var RepoConfig = /** @class */ (function () {
    function RepoConfig(data) {
        this._data = data;
    }
    RepoConfig.prototype.graphiteInitialized = function () {
        return fs_extra_1["default"].existsSync(CURRENT_REPO_CONFIG_PATH);
    };
    RepoConfig.prototype.save = function () {
        fs_extra_1["default"].writeFileSync(CURRENT_REPO_CONFIG_PATH, JSON.stringify(this._data, null, 2));
    };
    RepoConfig.prototype.getRepoOwner = function () {
        var configOwner = this._data.owner;
        if (configOwner) {
            return configOwner;
        }
        var inferredInfo = inferRepoGitHubInfo();
        if (inferredInfo === null || inferredInfo === void 0 ? void 0 : inferredInfo.repoOwner) {
            return inferredInfo.repoOwner;
        }
        throw new errors_1.ExitFailedError("Could not determine the owner of this repo (e.g. 'screenplaydev' in the repo 'screenplaydev/graphite-cli'). Please run `gt repo owner --set <owner>` to manually set the repo owner.");
    };
    RepoConfig.prototype.path = function () {
        return CURRENT_REPO_CONFIG_PATH;
    };
    RepoConfig.prototype.setTrunk = function (trunkName) {
        this._data.trunk = trunkName;
        this.save();
    };
    RepoConfig.prototype.getTrunk = function () {
        return this._data.trunk;
    };
    RepoConfig.prototype.addIgnoreBranchPatterns = function (ignoreBranches) {
        if (!this._data.ignoreBranches) {
            this._data.ignoreBranches = [];
        }
        this._data.ignoreBranches = this.getIgnoreBranches().concat(ignoreBranches);
        this.save();
    };
    RepoConfig.prototype.removeIgnoreBranches = function (branchPatternToRemove) {
        var ignoredBranches = this.getIgnoreBranches();
        this._data.ignoreBranches = ignoredBranches.filter(function (pattern) {
            return pattern != branchPatternToRemove;
        });
        this.save();
    };
    RepoConfig.prototype.getIgnoreBranches = function () {
        return this._data.ignoreBranches || [];
    };
    RepoConfig.prototype.setRepoOwner = function (owner) {
        this._data.owner = owner;
        this.save();
    };
    RepoConfig.prototype.getRepoName = function () {
        if (this._data.name) {
            return this._data.name;
        }
        var inferredInfo = inferRepoGitHubInfo();
        if (inferredInfo === null || inferredInfo === void 0 ? void 0 : inferredInfo.repoName) {
            return inferredInfo.repoName;
        }
        throw new errors_1.ExitFailedError("Could not determine the name of this repo (e.g. 'graphite-cli' in the repo 'screenplaydev/graphite-cli'). Please run `gt repo name --set <owner>` to manually set the repo name.");
    };
    RepoConfig.prototype.setRepoName = function (name) {
        this._data.name = name;
        this.save();
    };
    RepoConfig.prototype.getMaxDaysShownBehindTrunk = function () {
        var _a;
        this.migrateLogSettings();
        return (_a = this._data.maxDaysShownBehindTrunk) !== null && _a !== void 0 ? _a : 30;
    };
    RepoConfig.prototype.setMaxDaysShownBehindTrunk = function (n) {
        this.migrateLogSettings();
        this._data.maxDaysShownBehindTrunk = n;
        this.save();
    };
    RepoConfig.prototype.getMaxStacksShownBehindTrunk = function () {
        var _a;
        this.migrateLogSettings();
        return (_a = this._data.maxStacksShownBehindTrunk) !== null && _a !== void 0 ? _a : 10;
    };
    RepoConfig.prototype.setMaxStacksShownBehindTrunk = function (n) {
        this.migrateLogSettings();
        this._data.maxStacksShownBehindTrunk = n;
        this.save();
    };
    /*
     * Branch names are to be matched using glob patterns.
     */
    RepoConfig.prototype.branchIsIgnored = function (branchName) {
        return micromatch_1.isMatch(branchName, this.getIgnoreBranches());
    };
    /**
     * These settings used to (briefly) live in logSettings. Moving these to live
     * in the top-level namespace now that they're shared between multiple
     * commands (e.g. log and stacks).
     */
    RepoConfig.prototype.migrateLogSettings = function () {
        var _a, _b;
        var maxStacksShownBehindTrunk = (_a = this._data.logSettings) === null || _a === void 0 ? void 0 : _a.maxStacksShownBehindTrunk;
        if (maxStacksShownBehindTrunk !== undefined) {
            this._data.maxStacksShownBehindTrunk = maxStacksShownBehindTrunk;
        }
        var maxDaysShownBehindTrunk = (_b = this._data.logSettings) === null || _b === void 0 ? void 0 : _b.maxDaysShownBehindTrunk;
        if (maxDaysShownBehindTrunk !== undefined) {
            this._data.maxDaysShownBehindTrunk = maxDaysShownBehindTrunk;
        }
        this._data.logSettings = undefined;
        this.save();
    };
    RepoConfig.prototype.getMaxBranchLength = function () {
        var _a;
        return (_a = this._data.maxBranchLength) !== null && _a !== void 0 ? _a : 50;
    };
    RepoConfig.prototype.setMaxBranchLength = function (numCommits) {
        this._data.maxBranchLength = numCommits;
        this.save();
    };
    RepoConfig.prototype.getLastFetchedPRInfoMs = function () {
        return this._data.lastFetchedPRInfoMs;
    };
    RepoConfig.prototype.setLastFetchedPRInfoMs = function (time) {
        this._data.lastFetchedPRInfoMs = time;
        this.save();
    };
    return RepoConfig;
}());
function inferRepoGitHubInfo() {
    // This assumes that the remote to use is named 'origin' and that the remote
    // to fetch from is the same as the remote to push to. If a user runs into
    // an issue where any of these invariants are not true, they can manually
    // edit the repo config file to overrule what our CLI tries to intelligently
    // infer.
    var url = utils_1.gpExecSync({
        command: "git config --get remote.origin.url"
    }, function (_) {
        return Buffer.alloc(0);
    })
        .toString()
        .trim();
    var inferError = new errors_1.ExitFailedError("Failed to infer the owner and name of this repo from remote origin \"" + url + "\". Please run `gt repo owner --set <owner>` and `gt repo name --set <name>` to manually set the repo owner/name. (e.g. in the repo 'screenplaydev/graphite-cli', 'screenplaydev' is the repo owner and 'graphite-cli' is the repo name)");
    if (!url || url.length === 0) {
        throw inferError;
    }
    var _a = getOwnerAndNameFromURL(url), owner = _a.owner, name = _a.name;
    if (owner === undefined || name === undefined) {
        throw inferError;
    }
    return {
        repoOwner: owner,
        repoName: name
    };
}
function getOwnerAndNameFromURL(originURL) {
    var regex = undefined;
    // Most of the time these URLs end with '.git', but sometimes they don't. To
    // keep things clean, when we see it we'll just chop it off.
    var url = originURL;
    if (url.endsWith('.git')) {
        url = url.slice(0, -'.git'.length);
    }
    if (url.startsWith('git@github.com')) {
        regex = /git@github.com:([^/]+)\/(.+)/;
    }
    else if (url.startsWith('https://')) {
        regex = /https:\/\/github.com\/([^/]+)\/(.+)/;
    }
    else {
        return {
            owner: undefined,
            name: undefined
        };
    }
    // e.g. in screenplaydev/graphite-cli we're trying to get the owner
    // ('screenplaydev') and the repo name ('graphite-cli')
    var matches = regex.exec(url);
    return {
        owner: matches === null || matches === void 0 ? void 0 : matches[1],
        name: matches === null || matches === void 0 ? void 0 : matches[2]
    };
}
function getOwnerAndNameFromURLForTesting(originURL) {
    return getOwnerAndNameFromURL(originURL);
}
exports.getOwnerAndNameFromURLForTesting = getOwnerAndNameFromURLForTesting;
function readRepoConfig() {
    if (fs_extra_1["default"].existsSync(CURRENT_REPO_CONFIG_PATH)) {
        var repoConfigRaw = fs_extra_1["default"].readFileSync(CURRENT_REPO_CONFIG_PATH);
        try {
            var parsedConfig = JSON.parse(repoConfigRaw.toString().trim());
            return new RepoConfig(parsedConfig);
        }
        catch (e) {
            console.log(chalk_1["default"].yellow("Warning: Malformed " + CURRENT_REPO_CONFIG_PATH));
        }
    }
    return new RepoConfig({});
}
var repoConfigSingleton = readRepoConfig();
exports["default"] = repoConfigSingleton;
