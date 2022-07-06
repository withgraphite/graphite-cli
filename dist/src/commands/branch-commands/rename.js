"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = exports.builder = exports.description = exports.canonical = exports.aliases = exports.command = void 0;
const rename_branch_1 = require("../../actions/rename_branch");
const errors_1 = require("../../lib/errors");
const runner_1 = require("../../lib/runner");
const args = {
    name: {
        describe: `The new name for the current branch.`,
        demandOption: false,
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
exports.command = 'rename [name]';
exports.aliases = ['rn'];
exports.canonical = 'branch rename';
exports.description = 'Rename a branch and update metadata referencing it. If no branch name is supplied, you will be prompted for a new branch name. Note that this removes any associated GitHub pull request.';
exports.builder = args;
const handler = async (args) => {
    return (0, runner_1.graphite)(args, exports.canonical, async (context) => {
        if (!args.name && !context.interactive) {
            throw new errors_1.ExitFailedError(`Please supply a new branch name when in non-interactive mode`);
        }
        await (0, rename_branch_1.renameCurrentBranch)({ newBranchName: args.name, force: args.force }, context);
    });
};
exports.handler = handler;
//# sourceMappingURL=rename.js.map