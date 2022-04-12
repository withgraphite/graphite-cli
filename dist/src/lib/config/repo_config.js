"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOwnerAndNameFromURLForTesting = exports.repoConfigFactory = void 0;
const t = __importStar(require("@withgraphite/retype"));
const micromatch_1 = require("micromatch");
const errors_1 = require("../errors");
const utils_1 = require("../utils");
const compose_config_1 = require("./compose_config");
const schema = t.shape({
    owner: t.optional(t.string),
    name: t.optional(t.string),
    trunk: t.optional(t.string),
    remote: t.optional(t.string),
    ignoreBranches: t.optional(t.array(t.string)),
    maxStacksShownBehindTrunk: t.optional(t.number),
    maxDaysShownBehindTrunk: t.optional(t.number),
    maxBranchLength: t.optional(t.number),
    lastFetchedPRInfoMs: t.optional(t.number),
});
exports.repoConfigFactory = compose_config_1.composeConfig({
    schema,
    defaultLocations: [
        {
            relativePath: '.graphite_repo_config',
            relativeTo: 'REPO',
        },
    ],
    initialize: () => {
        return {};
    },
    helperFunctions: (data, update) => {
        return {
            getIgnoreBranches: () => data.ignoreBranches || [],
            getMaxBranchLength: () => { var _a; return (_a = data.maxBranchLength) !== null && _a !== void 0 ? _a : 50; },
            setRemote: (remote) => {
                update((data) => (data.remote = remote));
            },
            getRemote: () => { var _a; return (_a = data.remote) !== null && _a !== void 0 ? _a : 'origin'; },
            setTrunk: (trunk) => {
                update((data) => (data.trunk = trunk));
            },
            branchIsIgnored: (branchName) => data.ignoreBranches ? micromatch_1.isMatch(branchName, data.ignoreBranches) : false,
            graphiteInitialized: () => !!data.trunk,
            getMaxDaysShownBehindTrunk: () => { var _a; return (_a = data.maxDaysShownBehindTrunk) !== null && _a !== void 0 ? _a : 30; },
            getMaxStacksShownBehindTrunk: () => { var _a; return (_a = data.maxStacksShownBehindTrunk) !== null && _a !== void 0 ? _a : 10; },
            getRepoOwner: () => {
                var _a;
                const configOwner = data.owner;
                if (configOwner) {
                    return configOwner;
                }
                const inferredInfo = inferRepoGitHubInfo((_a = data.remote) !== null && _a !== void 0 ? _a : 'origin');
                if (inferredInfo === null || inferredInfo === void 0 ? void 0 : inferredInfo.repoOwner) {
                    return inferredInfo.repoOwner;
                }
                throw new errors_1.ExitFailedError("Could not determine the owner of this repo (e.g. 'withgraphite' in the repo 'withgraphite/graphite-cli'). Please run `gt repo owner --set <owner>` to manually set the repo owner.");
            },
            addIgnoreBranchPatterns: (ignoreBranches) => {
                update((data) => {
                    data.ignoreBranches = (data.ignoreBranches || []).concat(ignoreBranches);
                });
            },
            removeIgnoreBranches: (branchPatternToRemove) => {
                update((data) => {
                    if (!data.ignoreBranches) {
                        return;
                    }
                    data.ignoreBranches = data.ignoreBranches.filter(function (pattern) {
                        return pattern != branchPatternToRemove;
                    });
                });
            },
            getRepoName: () => {
                var _a;
                if (data.name) {
                    return data.name;
                }
                const inferredInfo = inferRepoGitHubInfo((_a = data.remote) !== null && _a !== void 0 ? _a : 'origin');
                if (inferredInfo === null || inferredInfo === void 0 ? void 0 : inferredInfo.repoName) {
                    return inferredInfo.repoName;
                }
                throw new errors_1.ExitFailedError("Could not determine the name of this repo (e.g. 'graphite-cli' in the repo 'withgraphite/graphite-cli'). Please run `gt repo name --set <owner>` to manually set the repo name.");
            },
        };
    },
});
function inferRepoGitHubInfo(remote) {
    // This assumes the remote to fetch from is the same as the remote to push to.
    // If a user runs into this is not true, they can manually edit the repo config
    // file to overrule what our CLI tries to intelligently infer.
    const url = utils_1.gpExecSync({
        command: `git config --get remote.${remote}.url`,
    }, (_) => {
        return Buffer.alloc(0);
    })
        .toString()
        .trim();
    const inferError = new errors_1.ExitFailedError(`Failed to infer the owner and name of this repo from remote ${remote} "${url}". Please run \`gt repo owner --set <owner>\` and \`gt repo name --set <name>\` to manually set the repo owner/name. (e.g. in the repo 'withgraphite/graphite-cli', 'withgraphite' is the repo owner and 'graphite-cli' is the repo name)`);
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
    // e.g. in withgraphite/graphite-cli we're trying to get the owner
    // ('withgraphite') and the repo name ('graphite-cli')
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
//# sourceMappingURL=repo_config.js.map