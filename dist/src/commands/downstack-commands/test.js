"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = exports.builder = exports.description = exports.aliases = exports.canonical = exports.command = void 0;
const test_1 = require("../../actions/test");
const scope_spec_1 = require("../../lib/engine/scope_spec");
const runner_1 = require("../../lib/runner");
const args = {
    command: {
        describe: `The command you'd like to run on each branch of your downstack.`,
        demandOption: true,
        type: 'string',
        alias: 'c',
        positional: true,
    },
    trunk: {
        describe: `Run the command on the trunk branch in addition to the rest of the stack.`,
        demandOption: false,
        default: false,
        alias: 't',
        type: 'boolean',
    },
};
exports.command = 'test <command>';
exports.canonical = 'downstack test';
exports.aliases = ['t'];
exports.description = 'From trunk to the current branch, run the provided command on each branch and aggregate the results.';
exports.builder = args;
const handler = async (argv) => (0, runner_1.graphite)(argv, exports.canonical, async (context) => (0, test_1.testStack)({
    scope: scope_spec_1.SCOPE.DOWNSTACK,
    includeTrunk: argv.trunk,
    command: argv.command,
}, context));
exports.handler = handler;
//# sourceMappingURL=test.js.map