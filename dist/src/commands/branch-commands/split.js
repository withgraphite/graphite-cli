"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = exports.builder = exports.description = exports.aliases = exports.canonical = exports.command = void 0;
const split_1 = require("../../actions/split");
const runner_1 = require("../../lib/runner");
const args = {
    ['by-commit']: {
        describe: `Split by commit - slice up the history of this branch.`,
        demandOption: false,
        default: false,
        type: 'boolean',
        alias: ['c', 'commit'],
    },
    ['by-hunk']: {
        describe: `Split by hunk - split into new single-commit branches.`,
        demandOption: false,
        default: false,
        type: 'boolean',
        alias: ['h', 'hunk'],
    },
};
exports.command = 'split';
exports.canonical = 'branch split';
exports.aliases = ['sp'];
exports.description = 'Split the current branch into multiple single-commit branches.';
exports.builder = args;
const handler = async (argv) => (0, runner_1.graphite)(argv, exports.canonical, async (context) => (0, split_1.splitCurrentBranch)({
    style: argv['by-hunk']
        ? 'hunk'
        : argv['by-commit']
            ? 'commit'
            : undefined,
}, context));
exports.handler = handler;
//# sourceMappingURL=split.js.map