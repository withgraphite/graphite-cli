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
exports.handler = exports.builder = exports.description = exports.canonical = exports.command = void 0;
const show_branch_1 = require("../../actions/show_branch");
const telemetry_1 = require("../../lib/telemetry");
const args = {
    patch: {
        describe: `Show the changes made by each commit.`,
        demandOption: false,
        default: false,
        type: 'boolean',
        alias: 'p',
    },
};
exports.command = 'show';
exports.canonical = 'branch show';
exports.description = 'Show the commits of the current branch.';
exports.builder = args;
const handler = (argv) => __awaiter(void 0, void 0, void 0, function* () {
    return telemetry_1.profile(argv, exports.canonical, (context) => __awaiter(void 0, void 0, void 0, function* () {
        yield show_branch_1.showBranchAction(context, { patch: argv.patch });
    }));
});
exports.handler = handler;
//# sourceMappingURL=show.js.map