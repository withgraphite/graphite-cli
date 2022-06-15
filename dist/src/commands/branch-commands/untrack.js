"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = exports.builder = exports.description = exports.aliases = exports.canonical = exports.command = void 0;
const untrack_branch_1 = require("../../actions/untrack_branch");
const runner_1 = require("../../lib/runner");
const args = {
    branch: {
        describe: `Branch to stop tracking.`,
        demandOption: true,
        positional: true,
        type: 'string',
    },
    force: {
        describe: 'Will not prompt for confirmation before untracking a branch with children.',
        alias: 'f',
        default: false,
        type: 'boolean',
    },
};
exports.command = 'untrack <branch>';
exports.canonical = 'branch untrack';
exports.aliases = ['ut'];
exports.description = 'Stop tracking a branch with Graphite. If the branch has children, they will also be untracked.';
exports.builder = args;
const handler = async (argv) => (0, runner_1.graphite)(argv, exports.canonical, async (context) => (0, untrack_branch_1.untrackBranch)({
    branchName: argv.branch,
    force: argv.force,
}, context));
exports.handler = handler;
//# sourceMappingURL=untrack.js.map