"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = exports.builder = exports.description = exports.aliases = exports.canonical = exports.command = void 0;
const branch_traversal_1 = require("../../actions/branch_traversal");
const runner_1 = require("../../lib/runner");
const args = {};
exports.command = 'bottom';
exports.canonical = 'branch bottom';
exports.aliases = ['b'];
exports.description = 'Switch to the first branch from trunk in the current stack.';
exports.builder = args;
const handler = async (argv) => (0, runner_1.graphite)(argv, exports.canonical, async (context) => await (0, branch_traversal_1.switchBranchAction)({
    direction: 'BOTTOM',
}, context));
exports.handler = handler;
//# sourceMappingURL=bottom.js.map