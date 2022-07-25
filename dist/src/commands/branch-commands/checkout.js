"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = exports.builder = exports.aliases = exports.description = exports.canonical = exports.command = void 0;
const checkout_branch_1 = require("../../actions/checkout_branch");
const runner_1 = require("../../lib/runner");
const args = {
    branch: {
        describe: `Optional branch to checkout`,
        demandOption: false,
        type: 'string',
        positional: true,
        hidden: true,
    },
    'show-untracked': {
        describe: `Include untracked branched in interactive selection`,
        demandOption: false,
        type: 'boolean',
        positional: false,
        alias: 'u',
    },
};
exports.command = 'checkout [branch]';
exports.canonical = 'branch checkout';
exports.description = 'Switch to a branch. If no branch is provided, opens an interactive selector.';
exports.aliases = ['co'];
exports.builder = args;
const handler = async (argv) => (0, runner_1.graphite)(argv, exports.canonical, async (context) => (0, checkout_branch_1.checkoutBranch)({ branchName: argv.branch, showUntracked: argv['show-untracked'] }, context));
exports.handler = handler;
//# sourceMappingURL=checkout.js.map