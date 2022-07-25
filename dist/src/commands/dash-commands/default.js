"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = exports.aliases = exports.canonical = exports.builder = exports.description = exports.command = void 0;
const open_1 = __importDefault(require("open"));
const runner_1 = require("../../lib/runner");
const args = {};
exports.command = '*';
exports.description = 'Opens your Graphite dashboard in the web.';
exports.builder = args;
exports.canonical = 'dash';
exports.aliases = ['d'];
const DASHBOARD_URL = 'https://app.graphite.dev/';
const handler = async (argv) => (0, runner_1.graphiteWithoutRepo)(argv, exports.canonical, async () => void (0, open_1.default)(DASHBOARD_URL));
exports.handler = handler;
//# sourceMappingURL=default.js.map