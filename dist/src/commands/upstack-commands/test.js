"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = exports.builder = exports.description = exports.aliases = exports.canonical = exports.command = void 0;
const test_1 = require("../../actions/test");
const scope_spec_1 = require("../../lib/engine/scope_spec");
const runner_1 = require("../../lib/runner");
const args = {
    command: {
        describe: `The command you'd like to run on each branch of your upstack.`,
        demandOption: true,
        type: 'string',
        alias: 'c',
        positional: true,
    },
};
exports.command = 'test <command>';
exports.canonical = 'upstack test';
exports.aliases = ['t'];
exports.description = 'For each of the current branch and its descendants, run the provided command and aggregate the results.';
exports.builder = args;
const handler = async (argv) => (0, runner_1.graphite)(argv, exports.canonical, async (context) => (0, test_1.testStack)({ scope: scope_spec_1.SCOPE.UPSTACK, command: argv.command }, context));
exports.handler = handler;
//# sourceMappingURL=test.js.map