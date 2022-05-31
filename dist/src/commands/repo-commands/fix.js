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
exports.deleteMergedBranchesContinuation = exports.handler = exports.builder = exports.description = exports.canonical = exports.command = void 0;
const chalk_1 = __importDefault(require("chalk"));
const clean_branches_1 = require("../../actions/clean_branches");
const fix_dangling_branches_1 = require("../../actions/fix_dangling_branches");
const profile_1 = require("../../lib/telemetry/profile");
const branch_1 = require("../../wrapper-classes/branch");
const args = {
    force: {
        describe: `Don't prompt you to confirm whether to take a remediation (may include deleting already-merged branches and setting branch parents).`,
        demandOption: false,
        default: false,
        type: 'boolean',
        alias: 'f',
    },
    'show-delete-progress': {
        describe: `Show progress through merged branches.`,
        demandOption: false,
        default: false,
        type: 'boolean',
    },
};
exports.command = 'fix';
exports.canonical = 'repo fix';
exports.description = 'Search for and remediate common problems in your repo that slow Graphite down and/or cause bugs (e.g. stale branches, branches with unknown parents).';
exports.builder = args;
const handler = (argv) => __awaiter(void 0, void 0, void 0, function* () {
    return profile_1.profile(argv, exports.canonical, (context) => __awaiter(void 0, void 0, void 0, function* () {
        yield fix_dangling_branches_1.fixDanglingBranches(context, { force: argv.force });
        branchCountSanityCheck(context);
        const continuationFrame = {
            op: 'REPO_FIX_BRANCH_COUNT_SANTIY_CHECK_CONTINUATION',
        };
        yield clean_branches_1.cleanBranches({
            frame: {
                op: 'DELETE_BRANCHES_CONTINUATION',
                showDeleteProgress: argv['show-delete-progress'],
                force: argv.force,
            },
            parent: [continuationFrame],
        }, context);
        deleteMergedBranchesContinuation(context);
    }));
});
exports.handler = handler;
function branchCountSanityCheck(context) {
    const branchCount = branch_1.Branch.allBranches(context).length;
    if (branchCount > 50) {
        console.log(chalk_1.default.yellow(`Found ${branchCount} total branches in the local repo which may be causing performance issues with Graphite. We recommend culling as many unneeded branches as possible to optimize Graphite performance.`));
        context.splog.logTip(`To further reduce Graphite's search space, you can also tune the maximum days and/or stacks Graphite tracks behind trunk using \`gt repo max-days-behind-trunk --set\` or \`gt repo max-stacks-behind-trunk --set\`.`);
        context.splog.logNewline();
    }
}
function deleteMergedBranchesContinuation(context) {
    context.splog.logNewline();
    context.splog.logInfo(`Still seeing issues with Graphite? Send us feedback via \`gt feedback '<your_issue'> --with-debug-context\` and we'll dig in!`);
}
exports.deleteMergedBranchesContinuation = deleteMergedBranchesContinuation;
//# sourceMappingURL=fix.js.map