"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchUpgradePromptInBackground = void 0;
const graphite_cli_routes_1 = __importDefault(require("@withgraphite/graphite-cli-routes"));
const retyped_routes_1 = require("@withgraphite/retyped-routes");
const package_json_1 = require("../../package.json");
const server_1 = require("../lib/api/server");
const message_config_1 = require("../lib/config/message_config");
const context_1 = require("../lib/telemetry/context");
const post_traces_1 = require("../lib/telemetry/post_traces");
const spawn_1 = require("../lib/utils/spawn");
function printAndClearOldMessage(context) {
    const oldMessage = context.messageConfig.data.message;
    // "Since we fetch the message asynchronously and display it when the user runs their next Graphite command,
    // double-check before showing the message if the CLI is still an old version
    // (i.e. the user hasn't updated the CLI in the meantime)."
    if (oldMessage && package_json_1.version == oldMessage.cliVersion) {
        context.splog.message(oldMessage.contents);
        context.messageConfig.update((data) => (data.message = undefined));
    }
}
function fetchUpgradePromptInBackground(context) {
    printAndClearOldMessage(context);
    (0, spawn_1.spawnDetached)(__filename);
}
exports.fetchUpgradePromptInBackground = fetchUpgradePromptInBackground;
async function fetchUpgradePrompt(messageConfig) {
    if (!post_traces_1.SHOULD_REPORT_TELEMETRY) {
        return;
    }
    try {
        const user = (0, context_1.getUserEmail)();
        const response = await retyped_routes_1.request.requestWithArgs(server_1.API_SERVER, graphite_cli_routes_1.default.upgradePrompt, {}, {
            user: user || 'NotFound',
            currentVersion: package_json_1.version,
        });
        if (response._response.status == 200) {
            if (response.prompt) {
                const message = response.prompt.message;
                messageConfig.update((data) => (data.message = {
                    contents: message,
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
}
if (process.argv[1] === __filename) {
    void fetchUpgradePrompt(message_config_1.messageConfigFactory.load());
}
//# sourceMappingURL=upgrade_prompt.js.map