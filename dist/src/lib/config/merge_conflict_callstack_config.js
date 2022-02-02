"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearPersistedMergeConflictCallstack = exports.getPersistedMergeConflictCallstack = exports.persistMergeConflictCallstack = void 0;
const chalk_1 = __importDefault(require("chalk"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const utils_1 = require("../utils");
const repo_root_path_1 = require("./repo_root_path");
const CONFIG_NAME = '.graphite_merge_conflict';
const CURRENT_REPO_CONFIG_PATH = path_1.default.join(repo_root_path_1.getRepoRootPath(), CONFIG_NAME);
function persistMergeConflictCallstack(callstack) {
    fs_extra_1.default.writeFileSync(CURRENT_REPO_CONFIG_PATH, JSON.stringify(callstack, null, 2));
}
exports.persistMergeConflictCallstack = persistMergeConflictCallstack;
function getPersistedMergeConflictCallstack() {
    if (fs_extra_1.default.existsSync(CURRENT_REPO_CONFIG_PATH)) {
        const repoConfigRaw = fs_extra_1.default.readFileSync(CURRENT_REPO_CONFIG_PATH);
        try {
            return JSON.parse(repoConfigRaw.toString().trim());
        }
        catch (e) {
            utils_1.logDebug(chalk_1.default.yellow(`Warning: Malformed ${CURRENT_REPO_CONFIG_PATH}`));
        }
    }
    return null;
}
exports.getPersistedMergeConflictCallstack = getPersistedMergeConflictCallstack;
function clearPersistedMergeConflictCallstack() {
    fs_extra_1.default.unlinkSync(CURRENT_REPO_CONFIG_PATH);
}
exports.clearPersistedMergeConflictCallstack = clearPersistedMergeConflictCallstack;
//# sourceMappingURL=merge_conflict_callstack_config.js.map