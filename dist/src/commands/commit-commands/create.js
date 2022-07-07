"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = exports.builder = exports.description = exports.aliases = exports.canonical = exports.command = void 0;
const commit_create_1 = require("../../actions/commit_create");
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
        describe: 'The message for the new commit.',
        required: false,
    },
};
exports.command = 'create';
exports.canonical = 'commit create';
exports.aliases = ['c'];
exports.description = 'Create a new commit and restack upstack branches.';
exports.builder = args;
const handler = async (argv) => {
    return (0, runner_1.graphite)(argv, exports.canonical, async (context) => (0, commit_create_1.commitCreateAction)({
        message: argv.message,
        addAll: argv.all,
    }, context));
};
exports.handler = handler;
//# sourceMappingURL=create.js.map