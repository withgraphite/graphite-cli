"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = exports.builder = exports.canonical = exports.description = exports.command = void 0;
const runner_1 = require("../../lib/runner");
const args = {
    enable: {
        demandOption: false,
        default: false,
        type: 'boolean',
        describe: 'Enable tips.',
    },
    disable: {
        demandOption: false,
        default: false,
        type: 'boolean',
        describe: 'Disable tips.',
    },
};
exports.command = 'tips';
exports.description = 'Show tips while using Graphite';
exports.canonical = 'user tips';
exports.builder = args;
const handler = async (argv) => {
    return (0, runner_1.graphiteWithoutRepo)(argv, exports.canonical, async (context) => {
        if (argv.enable) {
            context.userConfig.update((data) => (data.tips = true));
            context.splog.info(`tips enabled`);
        }
        else if (argv.disable) {
            context.userConfig.update((data) => (data.tips = false));
            context.splog.info(`tips disabled`);
        }
        else {
            context.userConfig.data.tips
                ? context.splog.info(`tips enabled`)
                : context.splog.info(`tips disabled`);
        }
    });
};
exports.handler = handler;
//# sourceMappingURL=tips.js.map