"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = exports.builder = exports.description = exports.aliases = exports.canonical = exports.command = void 0;
const restack_1 = require("../actions/restack");
const runner_1 = require("../lib/runner");
const args = {
    all: {
        describe: `Stage all changes before continuing.`,
        demandOption: false,
        default: false,
        type: 'boolean',
        alias: 'a',
    },
};
exports.command = 'continue';
exports.canonical = 'continue';
exports.aliases = ['cont'];
exports.description = 'Continues the most recent Graphite command halted by a merge conflict.';
exports.builder = args;
const handler = async (argv) => (0, runner_1.graphite)(argv, exports.canonical, async (context) => (0, restack_1.continueRestack)({ addAll: argv.all }, context));
exports.handler = handler;
//# sourceMappingURL=continue.js.map