"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = exports.canonical = exports.aliases = exports.builder = exports.description = exports.command = void 0;
const log_1 = require("../../actions/log");
const log_short_classic_1 = require("../../actions/log_short_classic");
const runner_1 = require("../../lib/runner");
const args = {
    classic: {
        type: 'boolean',
        default: false,
        alias: 'c',
        describe: 'Use the old logging style, which runs out of screen real estate quicker. Other options will not work in classic mode.',
    },
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
exports.command = 'short';
exports.description = 'Log all stacks tracked by Graphite, arranged to show dependencies.';
exports.builder = args;
exports.aliases = ['s'];
exports.canonical = 'log short';
const handler = async (argv) => (0, runner_1.graphite)(argv, exports.canonical, async (context) => argv.classic
    ? (0, log_short_classic_1.logShortClassic)(context)
    : (0, log_1.logAction)({
        style: 'SHORT',
        reverse: argv.reverse,
        branchName: argv.steps || argv.stack
            ? context.metaCache.currentBranchPrecondition
            : context.metaCache.trunk,
        steps: argv.steps,
        showUntracked: argv['show-untracked'],
    }, context));
exports.handler = handler;
//# sourceMappingURL=short.js.map