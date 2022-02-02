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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.postTelemetryInBackground = void 0;
const graphite_cli_routes_1 = __importDefault(require("@screenplaydev/graphite-cli-routes"));
const retyped_routes_1 = require("@screenplaydev/retyped-routes");
const child_process_1 = __importDefault(require("child_process"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const tmp_1 = __importDefault(require("tmp"));
const _1 = require(".");
const package_json_1 = require("../../../package.json");
const config_1 = require("../../lib/config");
const api_1 = require("../api");
function saveTracesToTmpFile() {
    const tmpDir = tmp_1.default.dirSync();
    const json = _1.tracer.flushJson();
    const tracesPath = path_1.default.join(tmpDir.name, 'traces.json');
    fs_extra_1.default.writeFileSync(tracesPath, json);
    return tracesPath;
}
function saveOldTelemetryToFile(data) {
    const tmpDir = tmp_1.default.dirSync();
    const tracesPath = path_1.default.join(tmpDir.name, 'oldTelemetry.json');
    fs_extra_1.default.writeFileSync(tracesPath, JSON.stringify(data));
    return tracesPath;
}
function postTelemetryInBackground(oldDetails) {
    const tracesPath = saveTracesToTmpFile();
    const oldTelemetryPath = saveOldTelemetryToFile(oldDetails);
    child_process_1.default.spawn('/usr/bin/env', ['node', __filename, tracesPath, oldTelemetryPath], {
        detached: true,
        stdio: 'ignore',
    });
}
exports.postTelemetryInBackground = postTelemetryInBackground;
function logCommand(oldTelemetryFilePath) {
    return __awaiter(this, void 0, void 0, function* () {
        const data = JSON.parse(fs_extra_1.default.readFileSync(oldTelemetryFilePath).toString().trim());
        if (_1.SHOULD_REPORT_TELEMETRY && data) {
            try {
                yield retyped_routes_1.request.requestWithArgs(api_1.API_SERVER, graphite_cli_routes_1.default.logCommand, {
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
                            debugContext: undefined,
                        }
                        : undefined,
                });
            }
            catch (_a) {
                // dont log err
            }
        }
    });
}
function postTelemetry() {
    return __awaiter(this, void 0, void 0, function* () {
        if (!_1.SHOULD_REPORT_TELEMETRY) {
            return;
        }
        const tracesPath = process.argv[2];
        if (tracesPath && fs_extra_1.default.existsSync(tracesPath)) {
            // Failed to find traces file, exit
            try {
                yield retyped_routes_1.request.requestWithArgs(api_1.API_SERVER, graphite_cli_routes_1.default.traces, {
                    jsonTraces: fs_extra_1.default.readFileSync(tracesPath).toString(),
                    cliVersion: package_json_1.version,
                });
            }
            catch (err) {
                return;
            }
            // Cleanup despite it being a temp file.
            fs_extra_1.default.readFileSync(tracesPath);
        }
        const oldTelemetryFilePath = process.argv[3];
        if (oldTelemetryFilePath && fs_extra_1.default.existsSync(oldTelemetryFilePath)) {
            yield logCommand(oldTelemetryFilePath);
            // Cleanup despite it being a temp file.
            fs_extra_1.default.removeSync(oldTelemetryFilePath);
        }
    });
}
if (process.argv[1] === __filename) {
    void postTelemetry();
}
//# sourceMappingURL=post_traces.js.map