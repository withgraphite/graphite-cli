"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = exports.builder = exports.description = exports.canonical = exports.command = void 0;
const chalk_1 = __importDefault(require("chalk"));
const runner_1 = require("../../lib/runner");
const branch_name_1 = require("../../lib/utils/branch_name");
const args = {
    set: {
        demandOption: false,
        optional: true,
        type: 'string',
        alias: 's',
        describe: 'Set a new prefix for branch names.',
    },
    reset: {
        demandOption: false,
        optional: true,
        type: 'boolean',
        alias: 'r',
        describe: 'Turn off branch prefixing. Takes precendence over --set',
    },
};
exports.command = 'branch-prefix';
exports.canonical = 'user branch-prefix';
exports.description = 'The prefix which Graphite will prepend to generated branch names.';
exports.builder = args;
const handler = async (argv) => {
    return (0, runner_1.graphiteWithoutRepo)(argv, exports.canonical, async (context) => {
        if (argv.reset) {
            context.splog.info(`Reset branch-prefix`);
            (0, branch_name_1.setBranchPrefix)('', context);
        }
        else if (argv.set) {
            context.splog.info(`Set branch-prefix to "${chalk_1.default.green((0, branch_name_1.setBranchPrefix)(argv.set, context))}"`);
        }
        else {
            context.splog.info(context.userConfig.data.branchPrefix ||
                'branch-prefix is not set. Try running `gt user branch-prefix --set <prefix>` to update the value.');
        }
    });
};
exports.handler = handler;
//# sourceMappingURL=branch_prefix.js.map