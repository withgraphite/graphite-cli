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
const profile_1 = require("../../lib/telemetry/profile");
const exec_sync_1 = require("../../lib/utils/exec_sync");
const splog_1 = require("../../lib/utils/splog");
const args = {
    add: {
        demandOption: false,
        default: false,
        type: 'string',
        describe: 'Add a branch or glob pattern to be ignored by Graphite.',
    },
    remove: {
        demandOption: false,
        default: false,
        type: 'string',
        describe: 'Remove a branch or glob pattern from being ignored by Graphite.',
    },
};
exports.command = 'ignored-branches';
exports.canonical = 'repo ignore-branches';
exports.description = 'Specify glob patterns matching branch names for Graphite to ignore. ' +
    'Often branches that you never plan to create PRs and merge into trunk.';
exports.builder = args;
const handler = (argv) => __awaiter(void 0, void 0, void 0, function* () {
    return profile_1.profile(argv, exports.canonical, (context) => __awaiter(void 0, void 0, void 0, function* () {
        if (argv.add) {
            const foundBranches = findMatches(argv.add);
            if (foundBranches.length) {
                splog_1.logInfo(chalk_1.default.gray(`The following branches were found matching your pattern:`));
                foundBranches.split('\n').forEach((branch) => {
                    splog_1.logInfo(chalk_1.default.gray(branch.trim()));
                });
            }
            else {
                splog_1.logWarn(`No branches were found matching the provided pattern. Please make sure it is correct.`);
            }
            context.repoConfig.addIgnoreBranchPatterns([argv.add]);
            splog_1.logInfo(`Added (${argv.add}) to be ignored`);
        }
        else if (argv.remove) {
            if (context.repoConfig.getIgnoreBranches().includes(argv.remove)) {
                context.repoConfig.removeIgnoreBranches(argv.remove);
                splog_1.logInfo(`Removed pattern (${argv.remove}) from ignore list`);
            }
            else {
                splog_1.logInfo(`No pattern matching (${argv.remove}) found.`);
            }
        }
        else {
            const ignoredBranches = context.repoConfig.getIgnoreBranches();
            if (ignoredBranches.length) {
                splog_1.logInfo(`The following patterns are being ignored by Graphite:`);
                splog_1.logInfo(ignoredBranches.join('\n'));
            }
            else {
                splog_1.logInfo('No ignored branches');
            }
        }
    }));
});
exports.handler = handler;
function findMatches(branchName) {
    return exec_sync_1.gpExecSync({ command: `git branch --list '${branchName}'` })
        .toString()
        .trim();
}
//# sourceMappingURL=ignored_branches.js.map