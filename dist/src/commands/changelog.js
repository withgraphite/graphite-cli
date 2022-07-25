"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = exports.builder = exports.description = exports.aliases = exports.canonical = exports.command = void 0;
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const runner_1 = require("../lib/runner");
const args = {};
exports.command = 'changelog';
exports.canonical = 'changelog';
exports.aliases = ['changelog'];
exports.description = 'Show the Graphite CLI changelog.';
exports.builder = args;
const handler = async (argv) => (0, runner_1.graphiteWithoutRepo)(argv, exports.canonical, async (context) => {
    context.splog.info(fs_extra_1.default.readFileSync(path_1.default.join(__dirname, '..', '..', '.CHANGELOG.md'), {
        encoding: 'utf-8',
    }));
});
exports.handler = handler;
//# sourceMappingURL=changelog.js.map