"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = exports.builder = exports.description = exports.aliases = exports.canonical = exports.command = void 0;
const squash_1 = require("../../actions/squash");
const runner_1 = require("../../lib/runner");
const args = {
    message: {
        type: 'string',
        alias: 'm',
        describe: 'The updated message for the commit.',
        demandOption: false,
    },
    edit: {
        type: 'boolean',
        describe: 'Modify the existing commit message.',
        demandOption: false,
        default: true,
    },
    'no-edit': {
        type: 'boolean',
        describe: "Don't modify the existing commit message. Takes precedence over --edit",
        demandOption: false,
        default: false,
        alias: 'n',
    },
};
exports.command = 'squash';
exports.canonical = 'branch squash';
exports.aliases = ['sq'];
exports.description = 'Squash all commits in the current branch and restack upstack branches.';
exports.builder = args;
const handler = async (argv) => (0, runner_1.graphite)(argv, exports.canonical, async (context) => (0, squash_1.squashCurrentBranch)({
    message: argv.message,
    noEdit: argv['no-edit'] || !argv.edit,
}, context));
exports.handler = handler;
//# sourceMappingURL=squash.js.map