"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = exports.builder = exports.description = exports.canonical = exports.aliases = exports.command = void 0;
const init_1 = require("../../actions/init");
const runner_1 = require("../../lib/runner");
const args = {
    trunk: {
        describe: `The name of your trunk branch.`,
        demandOption: false,
        optional: true,
        type: 'string',
    },
};
exports.command = 'init';
exports.aliases = ['i'];
exports.canonical = 'repo init';
exports.description = 'Create or regenerate a `.graphite_repo_config` file.';
exports.builder = args;
const handler = async (argv) => (0, runner_1.graphite)(argv, exports.canonical, async (context) => {
    await (0, init_1.init)(context, argv.trunk);
});
exports.handler = handler;
//# sourceMappingURL=repo_init.js.map