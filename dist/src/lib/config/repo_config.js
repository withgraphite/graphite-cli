"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOwnerAndNameFromURLForTesting = void 0;
const chalk_1 = __importDefault(require("chalk"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const micromatch_1 = require("micromatch");
const errors_1 = require("../errors");
const utils_1 = require("../utils");
const repo_root_path_1 = require("./repo_root_path");
const CONFIG_NAME = '.graphite_repo_config';
const CURRENT_REPO_CONFIG_PATH = path_1.default.join((0, repo_root_path_1.getRepoRootPath)(), CONFIG_NAME);
class RepoConfig {
    constructor(data) {
        this._data = data;
    }
    graphiteInitialized() {
        return fs_extra_1.default.existsSync(CURRENT_REPO_CONFIG_PATH);
    }
    save() {
        fs_extra_1.default.writeFileSync(CURRENT_REPO_CONFIG_PATH, JSON.stringify(this._data, null, 2));
    }
    getRepoOwner() {
        const configOwner = this._data.owner;
        if (configOwner) {
            return configOwner;
        }
        const inferredInfo = inferRepoGitHubInfo();
        if (inferredInfo === null || inferredInfo === void 0 ? void 0 : inferredInfo.repoOwner) {
            return inferredInfo.repoOwner;
        }
        throw new errors_1.ExitFailedError("Could not determine the owner of this repo (e.g. 'screenplaydev' in the repo 'screenplaydev/graphite-cli'). Please run `gt repo owner --set <owner>` to manually set the repo owner.");
    }
    path() {
        return CURRENT_REPO_CONFIG_PATH;
    }
    setTrunk(trunkName) {
        this._data.trunk = trunkName;
        this.save();
    }
    getTrunk() {
        return this._data.trunk;
    }
    addIgnoreBranchPatterns(ignoreBranches) {
        if (!this._data.ignoreBranches) {
            this._data.ignoreBranches = [];
        }
        this._data.ignoreBranches = this.getIgnoreBranches().concat(ignoreBranches);
        this.save();
    }
    removeIgnoreBranches(branchPatternToRemove) {
        const ignoredBranches = this.getIgnoreBranches();
        this._data.ignoreBranches = ignoredBranches.filter(function (pattern) {
            return pattern != branchPatternToRemove;
        });
        this.save();
    }
    getIgnoreBranches() {
        return this._data.ignoreBranches || [];
    }
    setRepoOwner(owner) {
        this._data.owner = owner;
        this.save();
    }
    getRepoName() {
        if (this._data.name) {
            return this._data.name;
        }
        const inferredInfo = inferRepoGitHubInfo();
        if (inferredInfo === null || inferredInfo === void 0 ? void 0 : inferredInfo.repoName) {
            return inferredInfo.repoName;
        }
        throw new errors_1.ExitFailedError("Could not determine the name of this repo (e.g. 'graphite-cli' in the repo 'screenplaydev/graphite-cli'). Please run `gt repo name --set <owner>` to manually set the repo name.");
    }
    setRepoName(name) {
        this._data.name = name;
        this.save();
    }
    getMaxDaysShownBehindTrunk() {
        var _a;
        this.migrateLogSettings();
        return (_a = this._data.maxDaysShownBehindTrunk) !== null && _a !== void 0 ? _a : 30;
    }
    setMaxDaysShownBehindTrunk(n) {
        this.migrateLogSettings();
        this._data.maxDaysShownBehindTrunk = n;
        this.save();
    }
    getMaxStacksShownBehindTrunk() {
        var _a;
        this.migrateLogSettings();
        return (_a = this._data.maxStacksShownBehindTrunk) !== null && _a !== void 0 ? _a : 10;
    }
    setMaxStacksShownBehindTrunk(n) {
        this.migrateLogSettings();
        this._data.maxStacksShownBehindTrunk = n;
        this.save();
    }
    /*
     * Branch names are to be matched using glob patterns.
     */
    branchIsIgnored(branchName) {
        return (0, micromatch_1.isMatch)(branchName, this.getIgnoreBranches());
    }
    /**
     * These settings used to (briefly) live in logSettings. Moving these to live
     * in the top-level namespace now that they're shared between multiple
     * commands (e.g. log and stacks).
     */
    migrateLogSettings() {
        var _a, _b;
        const maxStacksShownBehindTrunk = (_a = this._data.logSettings) === null || _a === void 0 ? void 0 : _a.maxStacksShownBehindTrunk;
        if (maxStacksShownBehindTrunk !== undefined) {
            this._data.maxStacksShownBehindTrunk = maxStacksShownBehindTrunk;
        }
        const maxDaysShownBehindTrunk = (_b = this._data.logSettings) === null || _b === void 0 ? void 0 : _b.maxDaysShownBehindTrunk;
        if (maxDaysShownBehindTrunk !== undefined) {
            this._data.maxDaysShownBehindTrunk = maxDaysShownBehindTrunk;
        }
        this._data.logSettings = undefined;
        this.save();
    }
    getMaxBranchLength() {
        var _a;
        return (_a = this._data.maxBranchLength) !== null && _a !== void 0 ? _a : 50;
    }
    setMaxBranchLength(numCommits) {
        this._data.maxBranchLength = numCommits;
        this.save();
    }
    getLastFetchedPRInfoMs() {
        return this._data.lastFetchedPRInfoMs;
    }
    setLastFetchedPRInfoMs(time) {
        this._data.lastFetchedPRInfoMs = time;
        this.save();
    }
}
function inferRepoGitHubInfo() {
    // This assumes that the remote to use is named 'origin' and that the remote
    // to fetch from is the same as the remote to push to. If a user runs into
    // an issue where any of these invariants are not true, they can manually
    // edit the repo config file to overrule what our CLI tries to intelligently
    // infer.
    const url = (0, utils_1.gpExecSync)({
        command: `git config --get remote.origin.url`,
    }, (_) => {
        return Buffer.alloc(0);
    })
        .toString()
        .trim();
    const inferError = new errors_1.ExitFailedError(`Failed to infer the owner and name of this repo from remote origin "${url}". Please run \`gt repo owner --set <owner>\` and \`gt repo name --set <name>\` to manually set the repo owner/name. (e.g. in the repo 'screenplaydev/graphite-cli', 'screenplaydev' is the repo owner and 'graphite-cli' is the repo name)`);
    if (!url || url.length === 0) {
        throw inferError;
    }
    const { owner, name } = getOwnerAndNameFromURL(url);
    if (owner === undefined || name === undefined) {
        throw inferError;
    }
    return {
        repoOwner: owner,
        repoName: name,
    };
}
function getOwnerAndNameFromURL(originURL) {
    let regex = undefined;
    // Most of the time these URLs end with '.git', but sometimes they don't. To
    // keep things clean, when we see it we'll just chop it off.
    let url = originURL;
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
            name: undefined,
        };
    }
    // e.g. in screenplaydev/graphite-cli we're trying to get the owner
    // ('screenplaydev') and the repo name ('graphite-cli')
    const matches = regex.exec(url);
    return {
        owner: matches === null || matches === void 0 ? void 0 : matches[1],
        name: matches === null || matches === void 0 ? void 0 : matches[2],
    };
}
function getOwnerAndNameFromURLForTesting(originURL) {
    return getOwnerAndNameFromURL(originURL);
}
exports.getOwnerAndNameFromURLForTesting = getOwnerAndNameFromURLForTesting;
function readRepoConfig() {
    if (fs_extra_1.default.existsSync(CURRENT_REPO_CONFIG_PATH)) {
        const repoConfigRaw = fs_extra_1.default.readFileSync(CURRENT_REPO_CONFIG_PATH);
        try {
            const parsedConfig = JSON.parse(repoConfigRaw.toString().trim());
            return new RepoConfig(parsedConfig);
        }
        catch (e) {
            console.log(chalk_1.default.yellow(`Warning: Malformed ${CURRENT_REPO_CONFIG_PATH}`));
        }
    }
    return new RepoConfig({});
}
const repoConfigSingleton = readRepoConfig();
exports.default = repoConfigSingleton;
//# sourceMappingURL=repo_config.js.map