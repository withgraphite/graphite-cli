"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chalk_1 = __importDefault(require("chalk"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const os_1 = __importDefault(require("os"));
const path_1 = __importDefault(require("path"));
const DEPRECATED_CONFIG_NAME = ".graphite_repo_config";
const CONFIG_NAME = ".graphite_user_config";
const DEPRECATED_USER_CONFIG_PATH = path_1.default.join(os_1.default.homedir(), DEPRECATED_CONFIG_NAME);
const USER_CONFIG_PATH = path_1.default.join(os_1.default.homedir(), CONFIG_NAME);
if (fs_extra_1.default.existsSync(DEPRECATED_USER_CONFIG_PATH)) {
    if (fs_extra_1.default.existsSync(USER_CONFIG_PATH)) {
        fs_extra_1.default.removeSync(DEPRECATED_USER_CONFIG_PATH);
    }
    else {
        fs_extra_1.default.moveSync(DEPRECATED_USER_CONFIG_PATH, USER_CONFIG_PATH);
    }
}
class UserConfig {
    constructor(data) {
        this._data = data;
    }
    setAuthToken(authToken) {
        this._data.authToken = authToken;
        this.save();
    }
    getAuthToken() {
        return this._data.authToken;
    }
    setBranchPrefix(branchPrefix) {
        this._data.branchPrefix = branchPrefix;
        this.save();
    }
    getBranchPrefix() {
        return this._data.branchPrefix;
    }
    tipsEnabled() {
        var _a;
        return (_a = this._data.tips) !== null && _a !== void 0 ? _a : true;
    }
    toggleTips(enabled) {
        this._data.tips = enabled;
        this.save();
    }
    getEditor() {
        return this._data.editor;
    }
    setEditor(editor) {
        this._data.editor = editor;
        this.save();
    }
    save() {
        fs_extra_1.default.writeFileSync(USER_CONFIG_PATH, JSON.stringify(this._data));
    }
    path() {
        return USER_CONFIG_PATH;
    }
}
function readUserConfig() {
    if (fs_extra_1.default.existsSync(USER_CONFIG_PATH)) {
        const userConfigRaw = fs_extra_1.default.readFileSync(USER_CONFIG_PATH);
        try {
            const parsedConfig = JSON.parse(userConfigRaw.toString().trim());
            return new UserConfig(parsedConfig);
        }
        catch (e) {
            console.log(chalk_1.default.yellow(`Warning: Malformed ${USER_CONFIG_PATH}`));
        }
    }
    return new UserConfig({});
}
const userConfigSingleton = readUserConfig();
exports.default = userConfigSingleton;
//# sourceMappingURL=user_config.js.map