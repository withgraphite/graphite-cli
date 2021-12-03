"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerSigintHandler = exports.postTelemetryInBackground = exports.fetchUpgradePromptInBackground = exports.SHOULD_REPORT_TELEMETRY = exports.getUserEmail = exports.profile = exports.tracer = void 0;
const context_1 = require("./context");
Object.defineProperty(exports, "getUserEmail", { enumerable: true, get: function () { return context_1.getUserEmail; } });
const post_traces_1 = require("./post_traces");
Object.defineProperty(exports, "postTelemetryInBackground", { enumerable: true, get: function () { return post_traces_1.postTelemetryInBackground; } });
const profile_1 = require("./profile");
Object.defineProperty(exports, "profile", { enumerable: true, get: function () { return profile_1.profile; } });
const sigint_handler_1 = require("./sigint_handler");
Object.defineProperty(exports, "registerSigintHandler", { enumerable: true, get: function () { return sigint_handler_1.registerSigintHandler; } });
const tracer_1 = __importDefault(require("./tracer"));
exports.tracer = tracer_1.default;
const upgrade_prompt_1 = require("./upgrade_prompt");
Object.defineProperty(exports, "fetchUpgradePromptInBackground", { enumerable: true, get: function () { return upgrade_prompt_1.fetchUpgradePromptInBackground; } });
const SHOULD_REPORT_TELEMETRY = process.env.NODE_ENV != "development";
exports.SHOULD_REPORT_TELEMETRY = SHOULD_REPORT_TELEMETRY;
//# sourceMappingURL=index.js.map