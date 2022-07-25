"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = exports.builder = exports.description = exports.aliases = exports.canonical = exports.command = void 0;
const open_1 = __importDefault(require("open"));
const runner_1 = require("../lib/runner");
const args = {};
const DOCS_URL = 'https://docs.graphite.dev/guides/graphite-cli/familiarizing-yourself-with-gt';
exports.command = 'docs';
exports.canonical = 'docs';
exports.aliases = ['docs'];
exports.description = 'Show the Graphite CLI docs.';
exports.builder = args;
const handler = async (argv) => (0, runner_1.graphiteWithoutRepo)(argv, exports.canonical, async () => void (0, open_1.default)(DOCS_URL));
exports.handler = handler;
//# sourceMappingURL=docs.js.map