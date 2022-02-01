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
exports.postTelemetryInBackground = void 0;
var retyped_routes_1 = require("@screenplaydev/retyped-routes");
var child_process_1 = require("child_process");
var fs_extra_1 = require("fs-extra");
var graphite_cli_routes_1 = require("graphite-cli-routes");
var path_1 = require("path");
var tmp_1 = require("tmp");
var _1 = require(".");
var package_json_1 = require("../../../package.json");
var config_1 = require("../../lib/config");
var api_1 = require("../api");
function saveTracesToTmpFile() {
    var tmpDir = tmp_1["default"].dirSync();
    var json = _1.tracer.flushJson();
    var tracesPath = path_1["default"].join(tmpDir.name, 'traces.json');
    fs_extra_1["default"].writeFileSync(tracesPath, json);
    return tracesPath;
}
function saveOldTelemetryToFile(data) {
    var tmpDir = tmp_1["default"].dirSync();
    var tracesPath = path_1["default"].join(tmpDir.name, 'oldTelemetry.json');
    fs_extra_1["default"].writeFileSync(tracesPath, JSON.stringify(data));
    return tracesPath;
}
function postTelemetryInBackground(oldDetails) {
    var tracesPath = saveTracesToTmpFile();
    var oldTelemetryPath = saveOldTelemetryToFile(oldDetails);
    child_process_1["default"].spawn('/usr/bin/env', ['node', __filename, tracesPath, oldTelemetryPath], {
        detached: true,
        stdio: 'ignore'
    });
}
exports.postTelemetryInBackground = postTelemetryInBackground;
function logCommand(oldTelemetryFilePath) {
    return __awaiter(this, void 0, void 0, function () {
        var data, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    data = JSON.parse(fs_extra_1["default"].readFileSync(oldTelemetryFilePath).toString().trim());
                    if (!(_1.SHOULD_REPORT_TELEMETRY && data)) return [3 /*break*/, 4];
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, retyped_routes_1.request.requestWithArgs(api_1.API_SERVER, graphite_cli_routes_1["default"].logCommand, {
                            commandName: data.commandName,
                            durationMiliSeconds: data.durationMiliSeconds,
                            user: _1.getUserEmail() || 'NotFound',
                            auth: config_1.userConfig.getAuthToken(),
                            version: package_json_1.version,
                            err: data.err
                                ? {
                                    name: data.err.errName,
                                    message: data.err.errMessage,
                                    stackTrace: data.err.errStack || '',
                                    debugContext: undefined
                                }
                                : undefined
                        })];
                case 2:
                    _b.sent();
                    return [3 /*break*/, 4];
                case 3:
                    _a = _b.sent();
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    });
}
function postTelemetry() {
    return __awaiter(this, void 0, void 0, function () {
        var tracesPath, err_1, oldTelemetryFilePath;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!_1.SHOULD_REPORT_TELEMETRY) {
                        return [2 /*return*/];
                    }
                    tracesPath = process.argv[2];
                    if (!(tracesPath && fs_extra_1["default"].existsSync(tracesPath))) return [3 /*break*/, 5];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, retyped_routes_1.request.requestWithArgs(api_1.API_SERVER, graphite_cli_routes_1["default"].traces, {
                            jsonTraces: fs_extra_1["default"].readFileSync(tracesPath).toString(),
                            cliVersion: package_json_1.version
                        })];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 4];
                case 3:
                    err_1 = _a.sent();
                    return [2 /*return*/];
                case 4:
                    // Cleanup despite it being a temp file.
                    fs_extra_1["default"].readFileSync(tracesPath);
                    _a.label = 5;
                case 5:
                    oldTelemetryFilePath = process.argv[3];
                    if (!(oldTelemetryFilePath && fs_extra_1["default"].existsSync(oldTelemetryFilePath))) return [3 /*break*/, 7];
                    return [4 /*yield*/, logCommand(oldTelemetryFilePath)];
                case 6:
                    _a.sent();
                    // Cleanup despite it being a temp file.
                    fs_extra_1["default"].removeSync(oldTelemetryFilePath);
                    _a.label = 7;
                case 7: return [2 /*return*/];
            }
        });
    });
}
if (process.argv[1] === __filename) {
    void postTelemetry();
}
