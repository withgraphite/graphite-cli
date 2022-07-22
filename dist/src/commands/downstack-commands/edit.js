"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = exports.aliases = exports.builder = exports.description = exports.canonical = exports.command = void 0;
const edit_downstack_1 = require("../../actions/edit/edit_downstack");
const runner_1 = require("../../lib/runner");
const args = {
    input: {
        describe: `Path to file specifying stack edits. Using this argument skips prompting for stack edits and assumes the user has already formatted a list. Primarly used for unit tests.`,
        demandOption: false,
        hidden: true,
        type: 'string',
    },
};
exports.command = 'edit';
exports.canonical = 'downstack edit';
exports.description = 'Edit the order of the branches between trunk and the current branch, restacking all of their descendants.';
exports.builder = args;
exports.aliases = ['e'];
const handler = async (argv) => {
    return (0, runner_1.graphite)(argv, exports.canonical, async (context) => {
        await (0, edit_downstack_1.editDownstack)(argv.input, context);
    });
};
exports.handler = handler;
//# sourceMappingURL=edit.js.map