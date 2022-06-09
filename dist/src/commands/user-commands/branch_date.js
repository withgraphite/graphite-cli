"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = exports.builder = exports.description = exports.canonical = exports.command = void 0;
const runner_1 = require("../../lib/runner");
const branch_name_1 = require("../../lib/utils/branch_name");
const args = {
    enable: {
        demandOption: false,
        optional: true,
        type: 'boolean',
        describe: 'Enable date in auto-generated branch names',
    },
    disable: {
        demandOption: false,
        optional: true,
        type: 'boolean',
        describe: 'Disable date in auto-generated branch names',
    },
};
exports.command = 'branch-date';
exports.canonical = 'user branch-date';
exports.description = 'Toggle prepending date to auto-generated branch names on branch creation.';
exports.builder = args;
const handler = async (argv) => {
    return (0, runner_1.graphiteLite)(argv, exports.canonical, async (context) => {
        if (argv.enable) {
            context.userConfig.update((data) => (data.branchDate = true));
            context.splog.info(`Enabled date`);
        }
        else if (argv.disable) {
            context.userConfig.update((data) => (data.branchDate = false));
            context.splog.info(`Disabled date`);
        }
        else {
            context.splog.info(`Branch date is ${(0, branch_name_1.getBranchDateEnabled)(context) ? 'enabled' : 'disabled'}`);
        }
    });
};
exports.handler = handler;
//# sourceMappingURL=branch_date.js.map