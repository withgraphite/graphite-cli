"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = exports.builder = exports.canonical = exports.description = exports.command = exports.DEFAULT_GRAPHITE_EDITOR = void 0;
const telemetry_1 = require("../../lib/telemetry");
const utils_1 = require("../../lib/utils");
const default_editor_1 = require("../../lib/utils/default_editor");
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
exports.DEFAULT_GRAPHITE_EDITOR = 'nano';
exports.command = 'editor';
exports.description = 'Editor used when using Graphite';
exports.canonical = 'user editor';
exports.builder = args;
const handler = (argv) => __awaiter(void 0, void 0, void 0, function* () {
    return telemetry_1.profile(argv, exports.canonical, (context) => __awaiter(void 0, void 0, void 0, function* () {
        if (argv.set) {
            context.userConfig.update((data) => (data.editor = argv.set));
            utils_1.logInfo(`Editor preference set to: ${argv.set}`);
        }
        else if (argv.unset) {
            context.userConfig.update((data) => (data.editor = exports.DEFAULT_GRAPHITE_EDITOR));
            utils_1.logInfo(`Editor preference erased. Defaulting to Graphite default: ${exports.DEFAULT_GRAPHITE_EDITOR}`);
        }
        else {
            if (!context.userConfig.data.editor) {
                default_editor_1.setDefaultEditor(context);
            }
            utils_1.logInfo(`Current editor preference is set to : ${context.userConfig.data.editor}`);
        }
    }));
});
exports.handler = handler;
//# sourceMappingURL=editor.js.map