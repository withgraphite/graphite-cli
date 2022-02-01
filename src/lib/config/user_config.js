"use strict";
exports.__esModule = true;
var chalk_1 = require("chalk");
var fs_extra_1 = require("fs-extra");
var os_1 = require("os");
var path_1 = require("path");
var DEPRECATED_CONFIG_NAME = '.graphite_repo_config';
var CONFIG_NAME = '.graphite_user_config';
var DEPRECATED_USER_CONFIG_PATH = path_1["default"].join(os_1["default"].homedir(), DEPRECATED_CONFIG_NAME);
var USER_CONFIG_PATH = path_1["default"].join(os_1["default"].homedir(), CONFIG_NAME);
if (fs_extra_1["default"].existsSync(DEPRECATED_USER_CONFIG_PATH)) {
    if (fs_extra_1["default"].existsSync(USER_CONFIG_PATH)) {
        fs_extra_1["default"].removeSync(DEPRECATED_USER_CONFIG_PATH);
    }
    else {
        fs_extra_1["default"].moveSync(DEPRECATED_USER_CONFIG_PATH, USER_CONFIG_PATH);
    }
}
var UserConfig = /** @class */ (function () {
    function UserConfig(data) {
        this._data = data;
    }
    UserConfig.prototype.setAuthToken = function (authToken) {
        this._data.authToken = authToken;
        this.save();
    };
    UserConfig.prototype.getAuthToken = function () {
        return this._data.authToken;
    };
    UserConfig.prototype.setBranchPrefix = function (branchPrefix) {
        this._data.branchPrefix = branchPrefix;
        this.save();
    };
    UserConfig.prototype.getBranchPrefix = function () {
        return this._data.branchPrefix;
    };
    UserConfig.prototype.tipsEnabled = function () {
        var _a;
        return (_a = this._data.tips) !== null && _a !== void 0 ? _a : true;
    };
    UserConfig.prototype.toggleTips = function (enabled) {
        this._data.tips = enabled;
        this.save();
    };
    UserConfig.prototype.getEditor = function () {
        return this._data.editor;
    };
    UserConfig.prototype.setEditor = function (editor) {
        this._data.editor = editor;
        this.save();
    };
    UserConfig.prototype.save = function () {
        fs_extra_1["default"].writeFileSync(USER_CONFIG_PATH, JSON.stringify(this._data));
    };
    UserConfig.prototype.path = function () {
        return USER_CONFIG_PATH;
    };
    return UserConfig;
}());
function readUserConfig() {
    if (fs_extra_1["default"].existsSync(USER_CONFIG_PATH)) {
        var userConfigRaw = fs_extra_1["default"].readFileSync(USER_CONFIG_PATH);
        try {
            var parsedConfig = JSON.parse(userConfigRaw.toString().trim());
            return new UserConfig(parsedConfig);
        }
        catch (e) {
            console.log(chalk_1["default"].yellow("Warning: Malformed " + USER_CONFIG_PATH));
        }
    }
    return new UserConfig({});
}
var userConfigSingleton = readUserConfig();
exports["default"] = userConfigSingleton;
