"use strict";
exports.__esModule = true;
exports.clearPersistedMergeConflictCallstack = exports.getPersistedMergeConflictCallstack = exports.persistMergeConflictCallstack = void 0;
var chalk_1 = require("chalk");
var fs_extra_1 = require("fs-extra");
var path_1 = require("path");
var utils_1 = require("../utils");
var repo_root_path_1 = require("./repo_root_path");
var CONFIG_NAME = '.graphite_merge_conflict';
var CURRENT_REPO_CONFIG_PATH = path_1["default"].join(repo_root_path_1.getRepoRootPath(), CONFIG_NAME);
function persistMergeConflictCallstack(callstack) {
    fs_extra_1["default"].writeFileSync(CURRENT_REPO_CONFIG_PATH, JSON.stringify(callstack, null, 2));
}
exports.persistMergeConflictCallstack = persistMergeConflictCallstack;
function getPersistedMergeConflictCallstack() {
    if (fs_extra_1["default"].existsSync(CURRENT_REPO_CONFIG_PATH)) {
        var repoConfigRaw = fs_extra_1["default"].readFileSync(CURRENT_REPO_CONFIG_PATH);
        try {
            return JSON.parse(repoConfigRaw.toString().trim());
        }
        catch (e) {
            utils_1.logDebug(chalk_1["default"].yellow("Warning: Malformed " + CURRENT_REPO_CONFIG_PATH));
        }
    }
    return null;
}
exports.getPersistedMergeConflictCallstack = getPersistedMergeConflictCallstack;
function clearPersistedMergeConflictCallstack() {
    fs_extra_1["default"].unlinkSync(CURRENT_REPO_CONFIG_PATH);
}
exports.clearPersistedMergeConflictCallstack = clearPersistedMergeConflictCallstack;
