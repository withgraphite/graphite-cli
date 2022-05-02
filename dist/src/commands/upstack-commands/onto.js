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
const current_branch_onto_1 = require("../../actions/onto/current_branch_onto");
const telemetry_1 = require("../../lib/telemetry");
const args = {
    branch: {
        describe: `The branch to rebase the current stack onto.`,
        demandOption: true,
        optional: false,
        positional: true,
        type: 'string',
    },
};
exports.command = 'onto <branch>';
exports.canonical = 'upstack onto';
exports.description = 'Rebase all upstack branches onto the latest commit (tip) of the target branch.';
exports.builder = args;
const handler = (argv) => __awaiter(void 0, void 0, void 0, function* () {
    return telemetry_1.profile(argv, exports.canonical, (context) => __awaiter(void 0, void 0, void 0, function* () {
        current_branch_onto_1.currentBranchOntoAction({
            onto: argv.branch,
            mergeConflictCallstack: [],
        }, context);
    }));
});
exports.handler = handler;
//# sourceMappingURL=onto.js.map