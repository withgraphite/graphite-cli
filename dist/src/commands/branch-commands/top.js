"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = exports.description = exports.aliases = exports.canonical = exports.command = void 0;
const branch_traversal_1 = require("../../actions/branch_traversal");
const runner_1 = require("../../lib/runner");
const args = {};
exports.command = 'top';
exports.canonical = 'branch top';
exports.aliases = ['t'];
exports.description = 'Switch to the tip branch of the current stack. Prompts if ambiguous.';
const handler = async (argv) => (0, runner_1.graphite)(argv, exports.canonical, async (context) => await (0, branch_traversal_1.switchBranchAction)({
    direction: 'TOP',
}, context));
exports.handler = handler;
//# sourceMappingURL=top.js.map