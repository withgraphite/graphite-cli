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
const interactive_branch_selection_1 = require("../../actions/interactive_branch_selection");
const current_branch_onto_1 = require("../../actions/onto/current_branch_onto");
const preconditions_1 = require("../../lib/preconditions");
const telemetry_1 = require("../../lib/telemetry");
const args = {
    branch: {
        describe: `Optional branch to rebase the current stack onto.`,
        demandOption: false,
        positional: true,
        type: 'string',
    },
};
exports.command = 'onto [branch]';
exports.canonical = 'upstack onto';
exports.description = 'Rebase all upstack branches onto the latest commit (tip) of the target branch.';
exports.builder = args;
const handler = (argv) => __awaiter(void 0, void 0, void 0, function* () {
    return telemetry_1.profile(argv, exports.canonical, (context) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        const currentBranchName = preconditions_1.currentBranchPrecondition(context).name;
        current_branch_onto_1.currentBranchOntoAction({
            onto: (_a = argv.branch) !== null && _a !== void 0 ? _a : (yield interactive_branch_selection_1.interactiveBranchSelection(context, {
                message: `Choose a new base for ${chalk_1.default.yellow(currentBranchName)}`,
                omitCurrentUpstack: true,
            })),
            mergeConflictCallstack: [],
        }, context);
    }));
});
exports.handler = handler;
//# sourceMappingURL=onto.js.map