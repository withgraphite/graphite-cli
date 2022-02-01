"use strict";
exports.__esModule = true;
exports.readMessageConfigForTestingOnly = void 0;
var chalk_1 = require("chalk");
var fs_extra_1 = require("fs-extra");
var os_1 = require("os");
var path_1 = require("path");
var CONFIG_NAME = '.graphite_upgrade_message';
var MESSAGE_CONFIG_PATH = path_1["default"].join(os_1["default"].homedir(), CONFIG_NAME);
var MessageConfig = /** @class */ (function () {
    function MessageConfig(data) {
        this._data = data;
    }
    MessageConfig.prototype.setMessage = function (message) {
        this._data.message = message;
        this.save();
    };
    MessageConfig.prototype.getMessage = function () {
        return this._data.message;
    };
    MessageConfig.prototype.path = function () {
        return MESSAGE_CONFIG_PATH;
    };
    MessageConfig.prototype.save = function () {
        if (this._data.message !== undefined) {
            fs_extra_1["default"].writeFileSync(MESSAGE_CONFIG_PATH, JSON.stringify(this._data));
            return;
        }
        if (fs_extra_1["default"].existsSync(MESSAGE_CONFIG_PATH)) {
            fs_extra_1["default"].unlinkSync(MESSAGE_CONFIG_PATH);
            return;
        }
    };
    return MessageConfig;
}());
function readMessageConfig() {
    if (fs_extra_1["default"].existsSync(MESSAGE_CONFIG_PATH)) {
        var raw = fs_extra_1["default"].readFileSync(MESSAGE_CONFIG_PATH);
        try {
            var parsedConfig = JSON.parse(raw.toString().trim());
            return new MessageConfig(parsedConfig);
        }
        catch (e) {
            console.log(chalk_1["default"].yellow("Warning: Malformed " + MESSAGE_CONFIG_PATH));
        }
    }
    return new MessageConfig({});
}
function readMessageConfigForTestingOnly() {
    return readMessageConfig();
}
exports.readMessageConfigForTestingOnly = readMessageConfigForTestingOnly;
var messageConfigSingleton = readMessageConfig();
exports["default"] = messageConfigSingleton;
