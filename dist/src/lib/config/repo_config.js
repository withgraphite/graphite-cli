"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
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
exports.getOwnerAndNameFromURL = exports.repoConfigFactory = void 0;
const t = __importStar(require("@withgraphite/retype"));
const errors_1 = require("../errors");
const exec_sync_1 = require("../utils/exec_sync");
const compose_config_1 = require("./compose_config");
const schema = t.shape({
    owner: t.optional(t.string),
    name: t.optional(t.string),
    trunk: t.optional(t.string),
    remote: t.optional(t.string),
    lastFetchedPRInfoMs: t.optional(t.number),
});
exports.repoConfigFactory = (0, compose_config_1.composeConfig)({
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
            setRemote: (remote) => {
                update((data) => (data.remote = remote));
            },
            getRemote: () => data.remote ?? 'origin',
            setTrunk: (trunk) => {
                update((data) => (data.trunk = trunk));
            },
            graphiteInitialized: () => !!data.trunk,
            getRepoOwner: () => {
                const configOwner = data.owner;
                if (configOwner) {
                    return configOwner;
                }
                const inferredInfo = inferRepoGitHubInfo(data.remote ?? 'origin');
                if (inferredInfo?.repoOwner) {
                    return inferredInfo.repoOwner;
                }
                throw new errors_1.ExitFailedError("Could not determine the owner of this repo (e.g. 'withgraphite' in the repo 'withgraphite/graphite-cli'). Please run `gt repo owner --set <owner>` to manually set the repo owner.");
            },
            getRepoName: () => {
                if (data.name) {
                    return data.name;
                }
                const inferredInfo = inferRepoGitHubInfo(data.remote ?? 'origin');
                if (inferredInfo?.repoName) {
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
    const url = (0, exec_sync_1.gpExecSync)({
        command: `git config --get remote.${remote}.url`,
    });
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
const OWNER_NAME_REGEX = /.*github\.com[:/]([^/]+)\/(.+)/;
function getOwnerAndNameFromURL(originURL) {
    // Most of the time these URLs end with '.git', but sometimes they don't. To
    // keep things clean, when we see it we'll just chop it off.
    let url = originURL;
    if (url.endsWith('.git')) {
        url = url.slice(0, -'.git'.length);
    }
    // e.g. in withgraphite/graphite-cli we're trying to get the owner
    // ('withgraphite') and the repo name ('graphite-cli')
    const matches = OWNER_NAME_REGEX.exec(url);
    return {
        owner: matches?.[1],
        name: matches?.[2],
    };
}
exports.getOwnerAndNameFromURL = getOwnerAndNameFromURL;
//# sourceMappingURL=repo_config.js.map