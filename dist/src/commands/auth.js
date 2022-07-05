"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = exports.canonical = exports.builder = exports.description = exports.command = void 0;
const chalk_1 = __importDefault(require("chalk"));
const runner_1 = require("../lib/runner");
const args = {
    token: {
        type: 'string',
        alias: 't',
        describe: 'Auth token. Get it from: https://app.graphite.dev/activate.',
        demandOption: false,
    },
};
exports.command = 'auth';
exports.description = 'Add your auth token to enable Graphite CLI to create and update your PRs on GitHub.';
exports.builder = args;
exports.canonical = 'auth';
const handler = async (argv) => {
    return (0, runner_1.graphiteWithoutRepo)(argv, exports.canonical, async (context) => {
        if (argv.token) {
            context.userConfig.update((data) => (data.authToken = argv.token));
            context.splog.info(chalk_1.default.green(`🔐 Saved auth token to "${context.userConfig.path}"`));
            return;
        }
        context.splog.info(context.userConfig.data.authToken ?? 'No auth token set.');
    });
};
exports.handler = handler;
//# sourceMappingURL=auth.js.map