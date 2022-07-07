"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = exports.builder = exports.description = exports.aliases = exports.canonical = exports.command = void 0;
const track_branch_1 = require("../../actions/track_branch");
const runner_1 = require("../../lib/runner");
const args = {
    force: {
        describe: `Sets the parent of each branch to the most recent ancestor without interactive selection.`,
        demandOption: false,
        default: false,
        type: 'boolean',
        alias: 'f',
    },
};
exports.command = 'track';
exports.canonical = 'downstack track';
exports.aliases = ['tr'];
exports.description = "Track a series of untracked branches, by specifying each branch's parent, stopping when you reach a tracked branch.";
exports.builder = args;
const handler = async (argv) => (0, runner_1.graphite)(argv, exports.canonical, async (context) => await (0, track_branch_1.trackStack)({ force: argv.force }, context));
exports.handler = handler;
//# sourceMappingURL=track.js.map