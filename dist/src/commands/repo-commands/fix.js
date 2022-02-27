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
exports.branchCountSanityCheckContinuation = exports.handler = exports.builder = exports.description = exports.canonical = exports.command = void 0;
const chalk_1 = __importDefault(require("chalk"));
const clean_branches_1 = require("../../actions/clean_branches");
const fix_dangling_branches_1 = require("../../actions/fix_dangling_branches");
const telemetry_1 = require("../../lib/telemetry");
const utils_1 = require("../../lib/utils");
const branch_1 = __importDefault(require("../../wrapper-classes/branch"));
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
    return telemetry_1.profile(argv, exports.canonical, (context) => __awaiter(void 0, void 0, void 0, function* () {
        yield branchMetadataSanityChecks(argv.force, context);
        yield branchCountSanityCheck({
            force: argv.force,
            showDeleteProgress: argv['show-delete-progress'],
        }, context);
    }));
});
exports.handler = handler;
function branchMetadataSanityChecks(force, context) {
    return __awaiter(this, void 0, void 0, function* () {
        utils_1.logInfo(`Ensuring tracked branches in Graphite are all well-formed...`);
        if (fix_dangling_branches_1.existsDanglingBranches(context)) {
            utils_1.logNewline();
            console.log(chalk_1.default.yellow(`Found branches without a known parent to Graphite. This may cause issues detecting stacks; we recommend you select one of the proposed remediations or use \`gt upstack onto\` to restack the branch onto the appropriate parent.`));
            utils_1.logTip(`To ensure Graphite always has a known parent for your branch, create your branch through Graphite with \`gt branch create <branch_name>\`.`, context);
            utils_1.logNewline();
            yield fix_dangling_branches_1.fixDanglingBranches(context, force);
            utils_1.logNewline();
        }
        else {
            utils_1.logInfo(`All branches well-formed.`);
            utils_1.logNewline();
        }
    });
}
function branchCountSanityCheck(opts, context) {
    return __awaiter(this, void 0, void 0, function* () {
        const branchCount = branch_1.default.allBranches(context).length;
        if (branchCount > 50) {
            console.log(chalk_1.default.yellow(`Found ${branchCount} total branches in the local repo which may be causing performance issues with Graphite. We recommend culling as many unneeded branches as possible to optimize Graphite performance.`));
            utils_1.logTip(`To further reduce Graphite's search space, you can also tune the maximum days and/or stacks Graphite tracks behind trunk using \`gt repo max-days-behind-trunk --set\` or \`gt repo max-stacks-behind-trunk --set\`.`, context);
            utils_1.logNewline();
        }
        utils_1.logInfo(`Searching for any stale branches that can be removed...`);
        const continuationFrame = {
            op: 'REPO_FIX_BRANCH_COUNT_SANTIY_CHECK_CONTINUATION',
        };
        yield clean_branches_1.deleteMergedBranches({
            frame: {
                op: 'DELETE_BRANCHES_CONTINUATION',
                showDeleteProgress: opts.showDeleteProgress,
                force: opts.force,
            },
            parent: {
                frame: continuationFrame,
                parent: 'TOP_OF_CALLSTACK_WITH_NOTHING_AFTER',
            },
        }, context);
        yield branchCountSanityCheckContinuation(continuationFrame);
    });
}
function branchCountSanityCheckContinuation(frame) {
    return __awaiter(this, void 0, void 0, function* () {
        utils_1.logNewline();
        utils_1.logInfo(`Still seeing issues with Graphite? Send us feedback via \`gt feedback '<your_issue'> --with-debug-context\` and we'll dig in!`);
    });
}
exports.branchCountSanityCheckContinuation = branchCountSanityCheckContinuation;
//# sourceMappingURL=fix.js.map