#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.postTelemetryInBackground = exports.SHOULD_REPORT_TELEMETRY = void 0;
const graphite_cli_routes_1 = __importDefault(require("@withgraphite/graphite-cli-routes"));
const retyped_routes_1 = require("@withgraphite/retyped-routes");
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const tmp_1 = __importDefault(require("tmp"));
const package_json_1 = require("../../../package.json");
const server_1 = require("../api/server");
const user_config_1 = require("../config/user_config");
const tracer_1 = require("../telemetry/tracer");
const cute_string_1 = require("../utils/cute_string");
const spawn_1 = require("../utils/spawn");
const context_1 = require("./context");
exports.SHOULD_REPORT_TELEMETRY = process.env.NODE_ENV != 'development';
function saveTracesToTmpFile() {
    const tmpDir = tmp_1.default.dirSync();
    const json = tracer_1.tracer.flushJson();
    const tracesPath = path_1.default.join(tmpDir.name, 'traces.json');
    fs_extra_1.default.writeFileSync(tracesPath, json);
    return tracesPath;
}
function saveOldTelemetryToFile(data) {
    const tmpDir = tmp_1.default.dirSync();
    const tracesPath = path_1.default.join(tmpDir.name, 'oldTelemetry.json');
    fs_extra_1.default.writeFileSync(tracesPath, (0, cute_string_1.cuteString)(data));
    return tracesPath;
}
function postTelemetryInBackground(oldDetails) {
    const tracesPath = saveTracesToTmpFile();
    const oldTelemetryPath = saveOldTelemetryToFile(oldDetails);
    (0, spawn_1.spawnDetached)(__filename, [tracesPath, oldTelemetryPath]);
}
exports.postTelemetryInBackground = postTelemetryInBackground;
async function logCommand(oldTelemetryFilePath, authToken) {
    const data = JSON.parse(fs_extra_1.default.readFileSync(oldTelemetryFilePath).toString().trim());
    if (exports.SHOULD_REPORT_TELEMETRY && data) {
        try {
            await retyped_routes_1.request.requestWithArgs(server_1.API_SERVER, graphite_cli_routes_1.default.logCommand, {
                commandName: data.commandName,
                durationMiliSeconds: data.durationMiliSeconds,
                user: (0, context_1.getUserEmail)() || 'NotFound',
                auth: authToken,
                version: package_json_1.version,
                err: data.err
                    ? {
                        name: data.err.name,
                        message: data.err.message,
                        stackTrace: data.err.stack || '',
                        debugContext: undefined,
                    }
                    : undefined,
            });
        }
        catch {
            // dont log err
        }
    }
}
async function postTelemetry() {
    if (!exports.SHOULD_REPORT_TELEMETRY) {
        return;
    }
    const tracesPath = process.argv[2];
    if (tracesPath && fs_extra_1.default.existsSync(tracesPath)) {
        // Failed to find traces file, exit
        try {
            await retyped_routes_1.request.requestWithArgs(server_1.API_SERVER, graphite_cli_routes_1.default.traces, {
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
    const authToken = user_config_1.userConfigFactory.load().data.authToken;
    if (oldTelemetryFilePath && fs_extra_1.default.existsSync(oldTelemetryFilePath)) {
        await logCommand(oldTelemetryFilePath, authToken);
        // Cleanup despite it being a temp file.
        fs_extra_1.default.removeSync(oldTelemetryFilePath);
    }
}
if (process.argv[1] === __filename) {
    void postTelemetry();
}
//# sourceMappingURL=post_traces.js.map