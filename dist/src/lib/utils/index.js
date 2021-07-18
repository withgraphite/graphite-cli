"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.trunkBranches = exports.repoConfig = exports.userConfig = exports.makeId = exports.CURRENT_REPO_CONFIG_PATH = void 0;
const chalk_1 = __importDefault(require("chalk"));
const child_process_1 = require("child_process");
const fs_extra_1 = __importDefault(require("fs-extra"));
const os_1 = __importDefault(require("os"));
const path_1 = __importDefault(require("path"));
const CONFIG_NAME = ".graphite_repo_config";
const USER_CONFIG_PATH = path_1.default.join(os_1.default.homedir(), CONFIG_NAME);
exports.CURRENT_REPO_CONFIG_PATH = (() => {
    const repoRootPath = child_process_1.execSync(`git rev-parse --show-toplevel`)
        .toString()
        .trim();
    if (!repoRootPath || repoRootPath.length === 0) {
        return undefined;
    }
    return path_1.default.join(repoRootPath, CONFIG_NAME);
})();
function makeId(length) {
    let result = "";
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}
exports.makeId = makeId;
// TODO: validate the shape of this (possibly using retype)
exports.userConfig = {};
if (fs_extra_1.default.existsSync(USER_CONFIG_PATH)) {
    const userConfigRaw = fs_extra_1.default.readFileSync(USER_CONFIG_PATH);
    try {
        exports.userConfig = JSON.parse(userConfigRaw.toString().trim());
    }
    catch (e) {
        console.log(chalk_1.default.yellow(`Warning: Malformed ${USER_CONFIG_PATH}`));
    }
}
exports.repoConfig = {};
if (exports.CURRENT_REPO_CONFIG_PATH && fs_extra_1.default.existsSync(exports.CURRENT_REPO_CONFIG_PATH)) {
    const repoConfigRaw = fs_extra_1.default.readFileSync(exports.CURRENT_REPO_CONFIG_PATH);
    try {
        exports.repoConfig = JSON.parse(repoConfigRaw.toString().trim());
    }
    catch (e) {
        console.log(chalk_1.default.yellow(`Warning: Malformed ${exports.CURRENT_REPO_CONFIG_PATH}`));
    }
}
exports.trunkBranches = exports.repoConfig.trunkBranches;
//# sourceMappingURL=index.js.map