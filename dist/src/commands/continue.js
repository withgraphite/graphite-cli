"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = exports.builder = exports.description = exports.aliases = exports.canonical = exports.command = void 0;
const continue_1 = require("../actions/continue");
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
const handler = async (argv) => (0, runner_1.graphite)(argv, exports.canonical, async (context) => await (0, continue_1.continueAction)({ addAll: argv.all }, context));
exports.handler = handler;
//# sourceMappingURL=continue.js.map