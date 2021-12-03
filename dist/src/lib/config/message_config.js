"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.readMessageConfigForTestingOnly = void 0;
const chalk_1 = __importDefault(require("chalk"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const os_1 = __importDefault(require("os"));
const path_1 = __importDefault(require("path"));
const CONFIG_NAME = ".graphite_upgrade_message";
const MESSAGE_CONFIG_PATH = path_1.default.join(os_1.default.homedir(), CONFIG_NAME);
class MessageConfig {
    constructor(data) {
        this._data = data;
    }
    setMessage(message) {
        this._data.message = message;
        this.save();
    }
    getMessage() {
        return this._data.message;
    }
    path() {
        return MESSAGE_CONFIG_PATH;
    }
    save() {
        if (this._data.message !== undefined) {
            fs_extra_1.default.writeFileSync(MESSAGE_CONFIG_PATH, JSON.stringify(this._data));
            return;
        }
        if (fs_extra_1.default.existsSync(MESSAGE_CONFIG_PATH)) {
            fs_extra_1.default.unlinkSync(MESSAGE_CONFIG_PATH);
            return;
        }
    }
}
function readMessageConfig() {
    if (fs_extra_1.default.existsSync(MESSAGE_CONFIG_PATH)) {
        const raw = fs_extra_1.default.readFileSync(MESSAGE_CONFIG_PATH);
        try {
            const parsedConfig = JSON.parse(raw.toString().trim());
            return new MessageConfig(parsedConfig);
        }
        catch (e) {
            console.log(chalk_1.default.yellow(`Warning: Malformed ${MESSAGE_CONFIG_PATH}`));
        }
    }
    return new MessageConfig({});
}
function readMessageConfigForTestingOnly() {
    return readMessageConfig();
}
exports.readMessageConfigForTestingOnly = readMessageConfigForTestingOnly;
const messageConfigSingleton = readMessageConfig();
exports.default = messageConfigSingleton;
//# sourceMappingURL=message_config.js.map