"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.spiffy = void 0;
const fs_extra_1 = __importDefault(require("fs-extra"));
const os_1 = __importDefault(require("os"));
const path_1 = __importDefault(require("path"));
const errors_1 = require("../errors");
const preconditions_1 = require("../preconditions");
const cute_string_1 = require("../utils/cute_string");
/**
 * Spiffy is our utility for Schematized Persisted Files
 * Pretty simple: we use Retype to define a schema which parsed JSON is validated against
 */
function spiffy(template) {
    const determinePath = (defaultPathOverride) => {
        const filePaths = spfAbsolutePaths(template.defaultLocations, defaultPathOverride);
        return filePaths.find((p) => fs_extra_1.default.existsSync(p)) || filePaths[0];
    };
    const loadHandler = (defaultPathOverride) => {
        const filePath = determinePath(defaultPathOverride);
        const _data = readOrInitSpf({
            filePath,
            schema: template.schema,
            initialize: template.initialize,
            removeIfInvalid: template.options?.removeIfEmpty || false,
        });
        const update = (mutator) => {
            mutator(_data);
            const shouldRemoveBecauseEmpty = template.options?.removeIfEmpty && (0, cute_string_1.cuteString)(_data) === (0, cute_string_1.cuteString)({});
            if (shouldRemoveBecauseEmpty) {
                fs_extra_1.default.removeSync(filePath);
            }
            else {
                fs_extra_1.default.writeFileSync(filePath, (0, cute_string_1.cuteString)(_data), {
                    mode: 0o600,
                });
            }
        };
        return {
            data: _data,
            update,
            path: filePath,
            delete: (defaultPathOverride) => {
                const curPath = determinePath(defaultPathOverride);
                if (fs_extra_1.default.existsSync(curPath)) {
                    fs_extra_1.default.removeSync(curPath);
                }
            },
            ...template.helperFunctions(_data, update),
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
exports.spiffy = spiffy;
function spfAbsolutePaths(defaultLocations, defaultPathOverride) {
    return (defaultPathOverride ? [defaultPathOverride] : []).concat(defaultLocations.map((l) => path_1.default.join(l.relativeTo === 'REPO' ? (0, preconditions_1.getRepoRootPathPrecondition)() : os_1.default.homedir(), l.relativePath)));
}
function readOrInitSpf({ filePath, schema, initialize, removeIfInvalid, }) {
    const spfExists = filePath && fs_extra_1.default.existsSync(filePath);
    try {
        const parsedFile = spfExists
            ? JSON.parse(fs_extra_1.default.readFileSync(filePath).toString()) // JSON.parse might throw.
            : initialize();
        const spfIsValid = schema(parsedFile, { logFailures: false });
        if (!spfIsValid) {
            throw new Error('Malformed data'); // expected to be caught below.
        }
        return parsedFile;
    }
    catch {
        if (removeIfInvalid) {
            fs_extra_1.default.removeSync(filePath);
            return initialize();
        }
        else {
            throw new errors_1.ExitFailedError(`Malformed data at ${filePath}`);
        }
    }
}
//# sourceMappingURL=spiffy.js.map