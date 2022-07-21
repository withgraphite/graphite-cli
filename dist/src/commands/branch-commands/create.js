"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = exports.builder = exports.description = exports.canonical = exports.command = exports.aliases = void 0;
const create_branch_1 = require("../../actions/create_branch");
const runner_1 = require("../../lib/runner");
const args = {
    name: {
        type: 'string',
        positional: true,
        demandOption: false,
        optional: true,
        describe: 'The name of the new branch.',
        hidden: true,
    },
    message: {
        describe: `Commit staged changes on the new branch with this message.`,
        demandOption: false,
        type: 'string',
        alias: 'm',
    },
    all: {
        describe: `Stage all unstaged changes on the new branch with this message.`,
        demandOption: false,
        default: false,
        type: 'boolean',
        alias: 'a',
    },
    patch: {
        describe: `Pick hunks to stage before committing.`,
        demandOption: false,
        default: false,
        type: 'boolean',
        alias: 'p',
    },
    insert: {
        describe: `When true, any existing children of the current branch will become children of the new branch.`,
        demandOption: false,
        default: false,
        type: 'boolean',
        alias: 'i',
    },
};
exports.aliases = ['c'];
exports.command = 'create [name]';
exports.canonical = 'branch create';
exports.description = 'Create a new branch stacked on top of the current branch and commit staged changes. If no branch name is specified but a commit message is passed, generate a branch name from the commit message.';
exports.builder = args;
const handler = async (argv) => {
    return (0, runner_1.graphite)(argv, exports.canonical, async (context) => {
        await (0, create_branch_1.createBranchAction)({
            branchName: argv.name,
            message: argv.message,
            all: argv.all,
            insert: argv.insert,
            patch: argv.patch,
        }, context);
    });
};
exports.handler = handler;
//# sourceMappingURL=create.js.map