"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = exports.builder = exports.description = exports.canonical = exports.command = exports.aliases = void 0;
const delete_branch_1 = require("../../actions/delete_branch");
const runner_1 = require("../../lib/runner");
const args = {
    name: {
        type: 'string',
        positional: true,
        demandOption: true,
        optional: false,
        describe: 'The name of the branch to delete.',
    },
    force: {
        describe: `Delete the branch even if it is not merged or closed.`,
        demandOption: false,
        type: 'boolean',
        alias: 'f',
        default: false,
    },
};
exports.aliases = ['dl'];
exports.command = 'delete [name]';
exports.canonical = 'branch delete';
exports.description = 'Delete a branch and its corresponding Graphite metadata.';
exports.builder = args;
const handler = async (argv) => (0, runner_1.graphite)(argv, exports.canonical, async (context) => (0, delete_branch_1.deleteBranchAction)({ branchName: argv.name, force: argv.force }, context));
exports.handler = handler;
//# sourceMappingURL=delete.js.map