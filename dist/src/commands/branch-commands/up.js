"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = exports.builder = exports.description = exports.aliases = exports.canonical = exports.command = void 0;
const branch_traversal_1 = require("../../actions/branch_traversal");
const runner_1 = require("../../lib/runner");
const args = {
    steps: {
        describe: `The number of levels to traverse upstack.`,
        demandOption: false,
        default: 1,
        type: 'number',
        alias: 'n',
    },
};
exports.command = 'up [steps]';
exports.canonical = 'branch up';
exports.aliases = ['u'];
exports.description = 'Switch to the child of the current branch. Prompts if ambiguous.';
exports.builder = args;
const handler = async (argv) => (0, runner_1.graphite)(argv, exports.canonical, async (context) => await (0, branch_traversal_1.switchBranchAction)({
    direction: 'UP',
    numSteps: argv.steps,
}, context));
exports.handler = handler;
//# sourceMappingURL=up.js.map