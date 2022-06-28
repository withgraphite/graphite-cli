"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = exports.builder = exports.description = exports.canonical = exports.aliases = exports.command = void 0;
const rename_branch_1 = require("../../actions/rename_branch");
const runner_1 = require("../../lib/runner");
const args = {
    name: {
        describe: `The new name for the current branch.`,
        demandOption: true,
        type: 'string',
        positional: true,
    },
    force: {
        describe: `Allow renaming a branch that is already associated with an open GitHub pull request.`,
        demandOption: false,
        type: 'boolean',
        alias: 'f',
        default: false,
    },
};
exports.command = 'rename <name>';
exports.aliases = ['rn'];
exports.canonical = 'branch rename';
exports.description = 'Rename a branch and update metadata referencing it.  Note that this removes any associated GitHub pull request.';
exports.builder = args;
const handler = async (args) => (0, runner_1.graphite)(args, exports.canonical, async (context) => (0, rename_branch_1.renameCurrentBranch)({ newBranchName: args.name, force: args.force }, context));
exports.handler = handler;
//# sourceMappingURL=rename.js.map