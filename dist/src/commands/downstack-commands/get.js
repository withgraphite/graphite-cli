"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = exports.aliases = exports.builder = exports.description = exports.canonical = exports.command = void 0;
const get_1 = require("../../actions/sync/get");
const runner_1 = require("../../lib/runner");
const args = {
    branch: {
        describe: `Branch to get from remote`,
        demandOption: false,
        type: 'string',
        positional: true,
        hidden: true,
    },
    force: {
        describe: 'Overwrite all fetched branches with remote source of truth',
        demandOption: false,
        type: 'boolean',
        default: false,
        alias: 'f',
    },
};
exports.command = 'get [branch]';
exports.canonical = 'downstack get';
exports.description = 'Get branches from trunk to the specified branch from remote, prompting the user to resolve conflicts. If no branch is provided, get downstack from the current branch.';
exports.builder = args;
exports.aliases = ['g'];
const handler = async (argv) => (0, runner_1.graphite)(argv, exports.canonical, async (context) => await (0, get_1.getAction)({ branchName: argv.branch, force: argv.force }, context));
exports.handler = handler;
//# sourceMappingURL=get.js.map