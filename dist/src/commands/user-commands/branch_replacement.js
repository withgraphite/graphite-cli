"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = exports.builder = exports.description = exports.canonical = exports.command = void 0;
const runner_1 = require("../../lib/runner");
const branch_name_1 = require("../../lib/utils/branch_name");
const args = {
    ['set-underscore']: {
        demandOption: false,
        optional: true,
        type: 'boolean',
        describe: 'Use underscore (_) as the replacement character',
    },
    ['set-dash']: {
        demandOption: false,
        optional: true,
        type: 'boolean',
        describe: 'Use dash (-) as the replacement character',
    },
    ['set-empty']: {
        demandOption: false,
        optional: true,
        type: 'boolean',
        describe: 'Remove invalid characters from the branch name without replacing them',
    },
};
exports.command = 'branch-replacement';
exports.canonical = 'user branch-replacement';
exports.description = 'The character that will replace unsupported characters in generated branch names.';
exports.builder = args;
const handler = async (argv) => {
    return (0, runner_1.graphiteWithoutRepo)(argv, exports.canonical, async (context) => {
        if (argv['set-underscore']) {
            context.userConfig.update((data) => (data.branchReplacement = '_'));
            context.splog.info(`Set underscore (_) as the replacement character`);
        }
        else if (argv['set-dash']) {
            context.userConfig.update((data) => (data.branchReplacement = '-'));
            context.splog.info(`Set dash (-) as the replacement character`);
        }
        else if (argv['set-empty']) {
            context.userConfig.update((data) => (data.branchReplacement = ''));
            context.splog.info(`Invalid characters will be removed without being replaced`);
        }
        else {
            const replacement = (0, branch_name_1.getBranchReplacement)(context);
            context.splog.info(`Invalid characters will be ${replacement === ''
                ? 'removed without being replaced'
                : `replaced with ${replacement}`}`);
        }
    });
};
exports.handler = handler;
//# sourceMappingURL=branch_replacement.js.map