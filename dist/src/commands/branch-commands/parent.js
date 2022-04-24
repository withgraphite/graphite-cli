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
const preconditions_1 = require("../../lib/preconditions");
const telemetry_1 = require("../../lib/telemetry");
const utils_1 = require("../../lib/utils");
const args = {
    set: {
        type: 'string',
        describe: 'Manually set the stack parent of the current branch. This operation only modifies Graphite metadata and does not rebase any branches.',
        required: false,
    },
    reset: {
        type: 'boolean',
        describe: 'Disassociate the branch from its current tracked parent.',
        required: false,
    },
};
exports.command = 'parent';
exports.canonical = 'branch parent';
exports.description = 'Show the parent branch of your current branch (i.e. directly below the current branch in the stack) as tracked by Graphite. Branch location metadata is stored under `.git/refs/branch-metadata`.';
exports.builder = args;
const handler = (argv) => __awaiter(void 0, void 0, void 0, function* () {
    return telemetry_1.profile(argv, exports.canonical, (context) => __awaiter(void 0, void 0, void 0, function* () {
        const branch = preconditions_1.currentBranchPrecondition(context);
        if (argv.set) {
            setParent(branch, argv.set, context);
        }
        else if (argv.reset) {
            branch.clearParentMetadata();
        }
        else {
            const parent = branch.getParentFromMeta(context);
            if (parent) {
                console.log(parent.name);
            }
            else {
                utils_1.logInfo(`Current branch (${branch}) has no parent branch set in Graphite. Consider running \`gt stack fix\`, or \`gt upstack onto <parent>\` to set a parent branch in Graphite.`);
            }
        }
    }));
});
exports.handler = handler;
function setParent(branch, parent, context) {
    preconditions_1.branchExistsPrecondition(parent);
    const oldParent = branch.getParentFromMeta(context);
    branch.setParentBranchName(parent);
    utils_1.logInfo(`Updated (${branch}) parent from (${oldParent}) to (${chalk_1.default.green(parent)})`);
    return;
}
//# sourceMappingURL=parent.js.map