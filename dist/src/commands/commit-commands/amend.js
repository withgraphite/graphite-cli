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
const commit_amend_1 = require("../../actions/commit_amend");
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
        describe: 'The updated message for the commit.',
        demandOption: false,
    },
    edit: {
        type: 'boolean',
        describe: 'Modify the existing commit message.',
        demandOption: false,
        default: true,
    },
    'no-edit': {
        type: 'boolean',
        describe: "Don't modify the existing commit message. Takes precedence over --edit",
        demandOption: false,
        default: false,
        alias: 'n',
    },
};
exports.command = 'amend';
exports.canonical = 'commit amend';
exports.aliases = ['a'];
exports.description = 'Amend the most recent commit and fix upstack branches.';
exports.builder = args;
const handler = (argv) => __awaiter(void 0, void 0, void 0, function* () {
    return telemetry_1.profile(argv, exports.canonical, (context) => __awaiter(void 0, void 0, void 0, function* () {
        yield commit_amend_1.commitAmendAction({
            message: argv.message,
            noEdit: argv['no-edit'] || !argv.edit,
            addAll: argv.all,
        }, context);
    }));
});
exports.handler = handler;
//# sourceMappingURL=amend.js.map