"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.composeConfig = void 0;
const fs_extra_1 = __importDefault(require("fs-extra"));
const os_1 = __importDefault(require("os"));
const path_1 = __importDefault(require("path"));
const errors_1 = require("../errors");
const repo_root_path_1 = require("./repo_root_path");
function composeConfig(configTemplate) {
    const determinePath = (defaultPathOverride) => {
        const configPaths = configAbsolutePaths(configTemplate.defaultLocations, defaultPathOverride);
        return configPaths.find((p) => fs_extra_1.default.existsSync(p)) || configPaths[0];
    };
    const loadHandler = (defaultPathOverride) => {
        var _a;
        const curPath = determinePath(defaultPathOverride);
        const _data = readOrInitConfig(curPath, configTemplate.schema, configTemplate.initialize, { removeIfInvalid: ((_a = configTemplate.options) === null || _a === void 0 ? void 0 : _a.removeIfEmpty) || false });
        const update = (mutator) => {
            var _a;
            mutator(_data);
            const shouldRemoveBecauseEmpty = ((_a = configTemplate.options) === null || _a === void 0 ? void 0 : _a.removeIfEmpty) &&
                JSON.stringify(_data) === JSON.stringify({});
            if (shouldRemoveBecauseEmpty) {
                fs_extra_1.default.removeSync(curPath);
            }
            else {
                fs_extra_1.default.writeFileSync(curPath, JSON.stringify(_data, null, 2), {
                    mode: 0o600,
                });
            }
        };
        return Object.assign({ data: _data, update, path: curPath, delete: (defaultPathOverride) => {
                const curPath = determinePath(defaultPathOverride);
                if (fs_extra_1.default.existsSync(curPath)) {
                    fs_extra_1.default.removeSync(curPath);
                }
            } }, configTemplate.helperFunctions(_data, update));
    };
    return {
        load: loadHandler,
        loadIfExists: (defaultPathOverride) => {
            const curPath = determinePath(defaultPathOverride);
            if (!fs_extra_1.default.existsSync(curPath)) {
                return undefined;
            }
            return loadHandler(defaultPathOverride);
        },
    };
}
exports.composeConfig = composeConfig;
function configAbsolutePaths(defaultLocations, defaultPathOverride) {
    const repoRoot = repo_root_path_1.getRepoRootPath();
    const home = os_1.default.homedir();
    return (defaultPathOverride ? [defaultPathOverride] : []).concat(defaultLocations.map((l) => path_1.default.join(l.relativeTo === 'REPO' ? repoRoot : home, l.relativePath)));
}
function readOrInitConfig(configPath, schema, initialize, opts) {
    const hasExistingConfig = configPath && fs_extra_1.default.existsSync(configPath);
    try {
        const parsedConfig = hasExistingConfig
            ? JSON.parse(fs_extra_1.default.readFileSync(configPath).toString()) // JSON.parse might throw.
            : initialize();
        const isValidConfigFile = schema(parsedConfig, { logFailures: false });
        if (!isValidConfigFile) {
            throw new Error('Malformed config'); // expected to be caught below.
        }
        return parsedConfig;
    }
    catch (_a) {
        if ((opts === null || opts === void 0 ? void 0 : opts.removeIfInvalid) === true) {
            fs_extra_1.default.removeSync(configPath);
            return initialize();
        }
        else {
            throw new errors_1.ExitFailedError(`Malformed config file at ${configPath}`);
        }
    }
}
//# sourceMappingURL=compose_config.js.map