"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = exports.builder = exports.canonical = exports.description = exports.command = void 0;
const chalk_1 = __importDefault(require("chalk"));
const runner_1 = require("../../lib/runner");
const args = {
    set: {
        demandOption: false,
        default: '',
        type: 'string',
        describe: 'Set default editor for Graphite. eg --set vim',
    },
    unset: {
        demandOption: false,
        default: false,
        type: 'boolean',
        describe: 'Unset default editor for Graphite. eg --unset',
    },
};
exports.command = 'editor';
exports.description = 'The editor opened by Graphite';
exports.canonical = 'user editor';
exports.builder = args;
const handler = async (argv) => {
    return (0, runner_1.graphiteLite)(argv, exports.canonical, async (context) => {
        if (argv.set) {
            context.userConfig.update((data) => (data.editor = argv.set));
            context.splog.info(`Editor set to ${chalk_1.default.cyan(argv.set)}`);
        }
        else if (argv.unset) {
            context.userConfig.update((data) => (data.editor = undefined));
            context.splog.info(`Editor preference erased. Defaulting to your git editor (currently ${chalk_1.default.cyan(context.userConfig.getEditor())})`);
        }
        else {
            context.userConfig.data.editor
                ? context.splog.info(chalk_1.default.cyan(context.userConfig.data.editor))
                : context.splog.info(`Editor is not set. Graphite will use your git editor (currently ${chalk_1.default.cyan(context.userConfig.getEditor())})`);
        }
    });
};
exports.handler = handler;
//# sourceMappingURL=editor.js.map