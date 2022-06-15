"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = exports.builder = exports.description = exports.canonical = exports.command = exports.aliases = void 0;
const edit_branch_1 = require("../../actions/edit_branch");
const runner_1 = require("../../lib/runner");
const args = {};
exports.aliases = ['e'];
exports.command = 'edit';
exports.canonical = 'branch edit';
exports.description = "Run an interactive rebase on the current branch's commits and restack upstack branches.";
exports.builder = args;
const handler = async (argv) => {
    return (0, runner_1.graphite)(argv, exports.canonical, async (context) => (0, edit_branch_1.editBranchAction)(context));
};
exports.handler = handler;
//# sourceMappingURL=edit.js.map