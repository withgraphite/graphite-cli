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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = exports.builder = exports.description = exports.canonical = exports.command = void 0;
const chalk_1 = __importDefault(require("chalk"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const debug_context_1 = require("../../lib/debug-context");
const telemetry_1 = require("../../lib/telemetry");
const utils_1 = require("../../lib/utils");
const args = {
    recreate: {
        type: 'string',
        optional: true,
        alias: 'r',
        describe: 'Accepts a json block created by `gt feedback state`. Recreates a debug repo in a temp folder with a commit tree matching the state JSON.',
    },
    'recreate-from-file': {
        type: 'string',
        optional: true,
        alias: 'f',
        describe: 'Accepts a file containing a json block created by `gt feedback state`. Recreates a debug repo in a temp folder with a commit tree matching the state JSON.',
    },
};
exports.command = 'debug-context';
exports.canonical = 'feedback debug-context';
exports.description = 'Print a debug summary of your repo. Useful for creating bug report details.';
exports.builder = args;
const handler = (argv) => __awaiter(void 0, void 0, void 0, function* () {
    return (0, telemetry_1.profile)(argv, exports.canonical, () => __awaiter(void 0, void 0, void 0, function* () {
        if (argv['recreate-from-file']) {
            const dir = (0, debug_context_1.recreateState)(fs_extra_1.default.readFileSync(argv['recreate-from-file']).toString());
            (0, utils_1.logInfo)(`${chalk_1.default.green(dir)}`);
        }
        else if (argv.recreate) {
            const dir = (0, debug_context_1.recreateState)(argv.recreate);
            (0, utils_1.logInfo)(`${chalk_1.default.green(dir)}`);
        }
        else {
            (0, utils_1.logInfo)((0, debug_context_1.captureState)());
        }
    }));
});
exports.handler = handler;
//# sourceMappingURL=debug_context.js.map