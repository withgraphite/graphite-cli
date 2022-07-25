"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = exports.builder = exports.description = exports.aliases = exports.canonical = exports.command = void 0;
const track_branch_1 = require("../../actions/track_branch");
const runner_1 = require("../../lib/runner");
const args = {
    branch: {
        describe: `Tip of the stack to begin tracking. Defaults to the current branch.`,
        demandOption: false,
        positional: true,
        type: 'string',
        hidden: true,
    },
    force: {
        describe: `Sets the parent of each branch to the most recent ancestor without interactive selection.`,
        demandOption: false,
        default: false,
        type: 'boolean',
        alias: 'f',
    },
};
exports.command = 'track [branch]';
exports.canonical = 'downstack track';
exports.aliases = ['tr'];
exports.description = "Track a series of untracked branches, by specifying each's parent. Starts at the current (or provided) branch and stops when you reach a tracked branch.";
exports.builder = args;
const handler = async (argv) => (0, runner_1.graphite)(argv, exports.canonical, async (context) => await (0, track_branch_1.trackStack)({ branchName: argv.branch, force: argv.force }, context));
exports.handler = handler;
//# sourceMappingURL=track.js.map