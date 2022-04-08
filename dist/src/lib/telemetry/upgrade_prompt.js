"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchUpgradePromptInBackground = void 0;
const graphite_cli_routes_1 = __importDefault(require("@withgraphite/graphite-cli-routes"));
const retyped_routes_1 = require("@withgraphite/retyped-routes");
const _1 = require(".");
const package_json_1 = require("../../../package.json");
const api_1 = require("../api");
const utils_1 = require("../utils");
const spawn_1 = require("../utils/spawn");
const message_config_1 = require("./../config/message_config");
function printAndClearOldMessage(context) {
    const oldMessage = context.messageConfig.data.message;
    // "Since we fetch the message asynchronously and display it when the user runs their next Graphite command,
    // double-check before showing the message if the CLI is still an old version
    // (i.e. the user hasn't updated the CLI in the meantime)."
    if (oldMessage && package_json_1.version == oldMessage.cliVersion) {
        utils_1.logMessageFromGraphite(oldMessage.contents);
        context.messageConfig.update((data) => (data.message = undefined));
    }
}
function fetchUpgradePromptInBackground(context) {
    if (!context.repoConfig.graphiteInitialized()) {
        return;
    }
    printAndClearOldMessage(context);
    spawn_1.spawnDetached(__filename);
}
exports.fetchUpgradePromptInBackground = fetchUpgradePromptInBackground;
function fetchUpgradePrompt(messageConfig) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!_1.SHOULD_REPORT_TELEMETRY) {
            return;
        }
        try {
            const user = _1.getUserEmail();
            const response = yield retyped_routes_1.request.requestWithArgs(api_1.API_SERVER, graphite_cli_routes_1.default.upgradePrompt, {}, {
                user: user || 'NotFound',
                currentVersion: package_json_1.version,
            });
            if (response._response.status == 200) {
                if (response.prompt) {
                    messageConfig.update((data) => (data.message = {
                        contents: response.prompt.message,
                        cliVersion: package_json_1.version,
                    }));
                }
                else {
                    messageConfig.update((data) => (data.message = undefined));
                }
            }
        }
        catch (err) {
            return;
        }
    });
}
if (process.argv[1] === __filename) {
    void fetchUpgradePrompt(message_config_1.messageConfigFactory.load());
}
//# sourceMappingURL=upgrade_prompt.js.map