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
exports.handler = exports.aliases = exports.builder = exports.description = exports.canonical = exports.command = void 0;
const edit_downstack_1 = require("../../actions/edit/edit_downstack");
const telemetry_1 = require("../../lib/telemetry");
const args = {
    input: {
        describe: `Path to file specifying stack edits. Using this argument skips prompting for stack edits and assumes the user has already formatted a list. Primarly used for unit tests.`,
        demandOption: false,
        default: false,
        hidden: true,
        type: 'string',
    },
};
exports.command = 'edit';
exports.canonical = 'downstack edit';
exports.description = 'Edit the order of the branchs in the stack.';
exports.builder = args;
exports.aliases = ['e'];
const handler = (argv) => __awaiter(void 0, void 0, void 0, function* () {
    return telemetry_1.profile(argv, exports.canonical, (context) => __awaiter(void 0, void 0, void 0, function* () {
        yield edit_downstack_1.editDownstack(context, argv.input ? { inputPath: argv.input } : undefined);
    }));
});
exports.handler = handler;
//# sourceMappingURL=edit.js.map