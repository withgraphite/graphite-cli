"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = exports.canonical = exports.builder = exports.description = exports.command = void 0;
const log_1 = require("../../actions/log");
const runner_1 = require("../../lib/runner");
const args = {
    reverse: {
        describe: `Print the log upside down. Handy when you have a lot of branches!`,
        type: 'boolean',
        alias: 'r',
        default: false,
    },
    stack: {
        describe: `Only show ancestors and descendants of the current branch.`,
        type: 'boolean',
        alias: 's',
        default: false,
    },
    steps: {
        describe: `Only show this many levels upstack and downstack. Implies --stack.`,
        type: 'number',
        alias: 'n',
        default: undefined,
    },
    'show-untracked': {
        describe: `Include untracked branched in interactive selection`,
        demandOption: false,
        type: 'boolean',
        positional: false,
        alias: 'u',
    },
};
exports.command = '*';
exports.description = 'Log all branches tracked by Graphite, showing dependencies and info for each.';
exports.builder = args;
exports.canonical = 'log';
const handler = async (argv) => (0, runner_1.graphite)(argv, exports.canonical, async (context) => (0, log_1.logAction)({
    style: 'FULL',
    reverse: argv.reverse,
    branchName: argv.steps || argv.stack
        ? context.metaCache.currentBranchPrecondition
        : context.metaCache.trunk,
    steps: argv.steps,
    showUntracked: argv['show-untracked'],
}, context));
exports.handler = handler;
//# sourceMappingURL=default.js.map