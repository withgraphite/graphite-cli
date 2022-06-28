"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = exports.builder = exports.description = exports.aliases = exports.canonical = exports.command = void 0;
const track_branch_1 = require("../../actions/track_branch");
const runner_1 = require("../../lib/runner");
const args = {
    branch: {
        describe: `Branch to begin tracking. Defaults to the current branch.`,
        demandOption: false,
        positional: true,
        type: 'string',
    },
    parent: {
        describe: `The tracked branch's parent. If unset, prompts for a parent branch`,
        demandOption: false,
        positional: false,
        type: 'string',
        alias: 'p',
    },
};
exports.command = 'track [branch]';
exports.canonical = 'branch track';
exports.aliases = ['tr'];
exports.description = [
    'Start tracking the current branch (by default) with Graphite by selecting its parent.',
    'This command can also be used to fix corrupted Graphite metadata.',
].join(' ');
exports.builder = args;
const handler = async (argv) => (0, runner_1.graphite)(argv, exports.canonical, async (context) => await (0, track_branch_1.trackBranch)({ branchName: argv.branch, parentBranchName: argv.parent }, context));
exports.handler = handler;
//# sourceMappingURL=track.js.map