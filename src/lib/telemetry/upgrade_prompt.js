#!/usr/bin/env node
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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.fetchUpgradePromptInBackground = void 0;
var retyped_routes_1 = require("@screenplaydev/retyped-routes");
var child_process_1 = require("child_process");
var graphite_cli_routes_1 = require("graphite-cli-routes");
var _1 = require(".");
var package_json_1 = require("../../../package.json");
var api_1 = require("../api");
var config_1 = require("../config");
var utils_1 = require("../utils");
function printAndClearOldMessage() {
    var oldMessage = config_1.messageConfig.getMessage();
    // "Since we fetch the message asynchronously and display it when the user runs their next Graphite command,
    // double-check before showing the message if the CLI is still an old version
    // (i.e. the user hasn't updated the CLI in the meantime)."
    if (oldMessage && package_json_1.version == oldMessage.cliVersion) {
        utils_1.logMessageFromGraphite(oldMessage.contents);
        config_1.messageConfig.setMessage(undefined);
    }
}
function fetchUpgradePromptInBackground() {
    if (!config_1.repoConfig.graphiteInitialized()) {
        return;
    }
    printAndClearOldMessage();
    child_process_1["default"].spawn('/usr/bin/env', ['node', __filename], {
        detached: true,
        stdio: 'ignore'
    });
}
exports.fetchUpgradePromptInBackground = fetchUpgradePromptInBackground;
function fetchUpgradePrompt() {
    return __awaiter(this, void 0, void 0, function () {
        var user, response, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!_1.SHOULD_REPORT_TELEMETRY) {
                        return [2 /*return*/];
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    user = _1.getUserEmail();
                    return [4 /*yield*/, retyped_routes_1.request.requestWithArgs(api_1.API_SERVER, graphite_cli_routes_1["default"].upgradePrompt, {}, {
                            user: user || 'NotFound',
                            currentVersion: package_json_1.version
                        })];
                case 2:
                    response = _a.sent();
                    if (response._response.status == 200) {
                        if (response.prompt) {
                            config_1.messageConfig.setMessage({
                                contents: response.prompt.message,
                                cliVersion: package_json_1.version
                            });
                        }
                        else {
                            config_1.messageConfig.setMessage(undefined);
                        }
                    }
                    return [3 /*break*/, 4];
                case 3:
                    err_1 = _a.sent();
                    return [2 /*return*/];
                case 4: return [2 /*return*/];
            }
        });
    });
}
if (process.argv[1] === __filename) {
    void fetchUpgradePrompt();
}
