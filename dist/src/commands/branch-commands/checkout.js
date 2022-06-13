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
    },
};
exports.command = 'checkout [branch]';
exports.canonical = 'branch checkout';
exports.description = 'Switch to a branch.';
exports.aliases = ['co'];
exports.builder = args;
const handler = async (args) => (0, runner_1.graphite)(args, exports.canonical, async (context) => (0, checkout_branch_1.checkoutBranch)(args.branch, context));
exports.handler = handler;
//# sourceMappingURL=checkout.js.map