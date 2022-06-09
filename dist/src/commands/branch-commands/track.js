"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = exports.builder = exports.description = exports.aliases = exports.canonical = exports.command = void 0;
const track_branch_1 = require("../../actions/track_branch");
const runner_1 = require("../../lib/runner");
const args = {
    branch: {
        describe: `Branch to begin tracking.`,
        demandOption: false,
        positional: true,
        type: 'string',
    },
    parent: {
        describe: `The tracked branch's parent. Defaults to the current branch.`,
        demandOption: false,
        positional: false,
        type: 'string',
        alias: 'p',
    },
    force: {
        describe: [
            'Will not prompt for confirmation before changing the parent of an already tracked branch.',
            "Use with care! Required to change a valid branch's parent if --no-interactive is set.",
        ].join(' '),
        alias: 'f',
        default: false,
        type: 'boolean',
    },
};
exports.command = 'track [branch]';
exports.canonical = 'branch track';
exports.aliases = ['tr'];
exports.description = [
    'Start tracking a branch with Graphite by setting its parent to (by default) the current branch.',
    'This command can also be used to fix corrupted Graphite metadata.',
].join(' ');
exports.builder = args;
const handler = async (argv) => (0, runner_1.graphite)(argv, exports.canonical, async (context) => {
    const branchName = argv.branch;
    const parentBranchName = argv.parent ?? context.metaCache.currentBranchPrecondition;
    branchName
        ? await (0, track_branch_1.trackBranch)({
            branchName,
            parentBranchName,
            force: argv.force,
        }, context)
        : await (0, track_branch_1.trackBranchInteractive)(parentBranchName, context);
});
exports.handler = handler;
//# sourceMappingURL=track.js.map