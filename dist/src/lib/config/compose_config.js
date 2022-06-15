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
const preconditions_1 = require("../preconditions");
const cute_string_1 = require("../utils/cute_string");
function composeConfig(configTemplate) {
    const determinePath = (defaultPathOverride) => {
        const configPaths = configAbsolutePaths(configTemplate.defaultLocations, defaultPathOverride);
        return configPaths.find((p) => fs_extra_1.default.existsSync(p)) || configPaths[0];
    };
    const loadHandler = (defaultPathOverride) => {
        const configPath = determinePath(defaultPathOverride);
        const _data = readOrInitConfig({
            configPath,
            schema: configTemplate.schema,
            initialize: configTemplate.initialize,
            removeIfInvalid: configTemplate.options?.removeIfEmpty || false,
        });
        const update = (mutator) => {
            mutator(_data);
            const shouldRemoveBecauseEmpty = configTemplate.options?.removeIfEmpty &&
                (0, cute_string_1.cuteString)(_data) === (0, cute_string_1.cuteString)({});
            if (shouldRemoveBecauseEmpty) {
                fs_extra_1.default.removeSync(configPath);
            }
            else {
                fs_extra_1.default.writeFileSync(configPath, (0, cute_string_1.cuteString)(_data), {
                    mode: 0o600,
                });
            }
        };
        return {
            data: _data,
            update,
            path: configPath,
            delete: (defaultPathOverride) => {
                const curPath = determinePath(defaultPathOverride);
                if (fs_extra_1.default.existsSync(curPath)) {
                    fs_extra_1.default.removeSync(curPath);
                }
            },
            ...configTemplate.helperFunctions(_data, update),
        };
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
    return (defaultPathOverride ? [defaultPathOverride] : []).concat(defaultLocations.map((l) => path_1.default.join(l.relativeTo === 'REPO' ? (0, preconditions_1.getRepoRootPathPrecondition)() : os_1.default.homedir(), l.relativePath)));
}
function readOrInitConfig({ configPath, schema, initialize, removeIfInvalid, }) {
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
    catch {
        if (removeIfInvalid) {
            fs_extra_1.default.removeSync(configPath);
            return initialize();
        }
        else {
            throw new errors_1.ExitFailedError(`Malformed config file at ${configPath}`);
        }
    }
}
//# sourceMappingURL=compose_config.js.map