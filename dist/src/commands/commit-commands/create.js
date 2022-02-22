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
exports.handler = exports.builder = exports.description = exports.aliases = exports.canonical = exports.command = void 0;
const commit_create_1 = require("../../actions/commit_create");
const telemetry_1 = require("../../lib/telemetry");
const args = {
    all: {
        describe: `Stage all changes before committing.`,
        demandOption: false,
        default: false,
        type: 'boolean',
        alias: 'a',
    },
    message: {
        type: 'string',
        alias: 'm',
        describe: 'The message for the new commit.',
        required: false,
    },
};
exports.command = 'create';
exports.canonical = 'commit create';
exports.aliases = ['c'];
exports.description = 'Create a new commit and fix upstack branches.';
exports.builder = args;
const handler = (argv) => __awaiter(void 0, void 0, void 0, function* () {
    return telemetry_1.profile(argv, exports.canonical, () => __awaiter(void 0, void 0, void 0, function* () {
        yield commit_create_1.commitCreateAction({
            message: argv.message,
            addAll: argv.all,
        });
    }));
});
exports.handler = handler;
//# sourceMappingURL=create.js.map