"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = exports.builder = exports.description = exports.aliases = exports.canonical = exports.command = void 0;
const show_branch_1 = require("../../actions/show_branch");
const runner_1 = require("../../lib/runner");
const args = {
    patch: {
        describe: `Show the changes made by each commit.`,
        demandOption: false,
        default: false,
        type: 'boolean',
        alias: 'p',
    },
    description: {
        describe: `Show the PR description, if it exists.`,
        demandOption: false,
        default: false,
        type: 'boolean',
        alias: 'd',
    },
};
exports.command = 'info';
exports.canonical = 'branch info';
exports.aliases = ['i'];
exports.description = 'Display information about the current branch.';
exports.builder = args;
const handler = async (argv) => {
    return (0, runner_1.graphite)(argv, exports.canonical, async (context) => {
        await (0, show_branch_1.showBranchAction)(context.metaCache.currentBranchPrecondition, { patch: argv.patch, description: argv.description }, context);
    });
};
exports.handler = handler;
//# sourceMappingURL=info.js.map