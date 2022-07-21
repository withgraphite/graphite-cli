"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = exports.builder = exports.description = exports.canonical = exports.command = exports.aliases = void 0;
const restack_1 = require("../../actions/restack");
const scope_spec_1 = require("../../lib/engine/scope_spec");
const runner_1 = require("../../lib/runner");
const args = {};
exports.aliases = ['r', 'fix', 'f'];
exports.command = 'restack';
exports.canonical = 'stack restack';
exports.description = 'Ensure each branch in the current stack is based on its parent, rebasing if necessary.';
exports.builder = args;
const handler = async (argv) => (0, runner_1.graphite)(argv, exports.canonical, async (context) => (0, restack_1.restackBranches)(context.metaCache.getRelativeStack(context.metaCache.currentBranchPrecondition, scope_spec_1.SCOPE.STACK), context));
exports.handler = handler;
//# sourceMappingURL=restack.js.map