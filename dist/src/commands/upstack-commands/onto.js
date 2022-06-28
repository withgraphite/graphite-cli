"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = exports.builder = exports.description = exports.aliases = exports.canonical = exports.command = void 0;
const chalk_1 = __importDefault(require("chalk"));
const current_branch_onto_1 = require("../../actions/current_branch_onto");
const log_1 = require("../../actions/log");
const runner_1 = require("../../lib/runner");
const args = {
    branch: {
        describe: `Optional branch to rebase the current stack onto.`,
        demandOption: false,
        positional: true,
        type: 'string',
    },
};
exports.command = 'onto [branch]';
exports.canonical = 'upstack onto';
exports.aliases = ['o'];
exports.description = 'Rebase the current branch onto the latest commit of target branch and restack all of its descendants.';
exports.builder = args;
const handler = async (argv) => {
    return (0, runner_1.graphite)(argv, exports.canonical, async (context) => {
        (0, current_branch_onto_1.currentBranchOnto)(argv.branch ??
            (await (0, log_1.interactiveBranchSelection)({
                message: `Choose a new base for ${chalk_1.default.yellow(context.metaCache.currentBranchPrecondition)} (autocomplete or arrow keys)`,
                omitCurrentBranch: true,
            }, context)), context);
    });
};
exports.handler = handler;
//# sourceMappingURL=onto.js.map