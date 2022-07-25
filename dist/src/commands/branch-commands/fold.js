"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = exports.builder = exports.description = exports.canonical = exports.command = exports.aliases = void 0;
const fold_branch_1 = require("../../actions/fold_branch");
const runner_1 = require("../../lib/runner");
const args = {
    keep: {
        describe: `Keeps the name of the current branch instead of using the name of its parent.`,
        demandOption: false,
        type: 'boolean',
        alias: 'k',
        default: false,
    },
};
exports.aliases = ['f'];
exports.command = 'fold';
exports.canonical = 'branch fold';
exports.description = "Fold a branch's changes into its parent, update dependencies of descendants of the new combined branch, and restack.";
exports.builder = args;
const handler = async (argv) => (0, runner_1.graphite)(argv, exports.canonical, async (context) => (0, fold_branch_1.foldCurrentBranch)(argv.keep, context));
exports.handler = handler;
//# sourceMappingURL=fold.js.map