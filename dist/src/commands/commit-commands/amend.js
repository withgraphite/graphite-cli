"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = exports.builder = exports.description = exports.aliases = exports.canonical = exports.command = void 0;
const commit_amend_1 = require("../../actions/commit_amend");
const runner_1 = require("../../lib/runner");
const args = {
    all: {
        describe: `Stage all changes before committing.`,
        demandOption: false,
        default: false,
        type: 'boolean',
        alias: 'a',
    },
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
exports.command = 'amend';
exports.canonical = 'commit amend';
exports.aliases = ['a'];
exports.description = 'Amend the most recent commit and restack upstack branches.';
exports.builder = args;
const handler = async (argv) => {
    return (0, runner_1.graphite)(argv, exports.canonical, async (context) => (0, commit_amend_1.commitAmendAction)({
        message: argv.message,
        noEdit: argv['no-edit'] || !argv.edit,
        addAll: argv.all,
    }, context));
};
exports.handler = handler;
//# sourceMappingURL=amend.js.map