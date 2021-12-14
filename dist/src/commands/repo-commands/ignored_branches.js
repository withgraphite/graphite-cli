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
const config_1 = require("../../lib/config");
const telemetry_1 = require("../../lib/telemetry");
const utils_1 = require("../../lib/utils");
const chalk_1 = __importDefault(require("chalk"));
const args = {
    add: {
        demandOption: false,
        default: false,
        type: 'string',
        describe: 'Add a branch to be ignored by Graphite.',
    },
    remove: {
        demandOption: false,
        default: false,
        type: 'string',
        describe: 'Remove a branch pattern being ignored by Graphite.',
    },
};
exports.command = 'ignored-branches';
exports.canonical = 'repo ignore-branches';
exports.description = 'Specify glob patterns matching branch names for Graphite to ignore. ' +
    'Often branches that you never plan to create PRs and merge into trunk.';
exports.builder = args;
const handler = (argv) => __awaiter(void 0, void 0, void 0, function* () {
    return (0, telemetry_1.profile)(argv, exports.canonical, () => __awaiter(void 0, void 0, void 0, function* () {
        if (argv.add) {
            const foundBranches = findMatches(argv.add);
            if (foundBranches.length) {
                (0, utils_1.logInfo)(chalk_1.default.gray(`The following branches were found matching your pattern:`));
                foundBranches.split('/n').forEach((branch) => {
                    (0, utils_1.logInfo)(chalk_1.default.gray(branch.trim()));
                });
            }
            else {
                (0, utils_1.logWarn)(`No branches were found matching the provided pattern. Please make sure it is correct.`);
            }
            config_1.repoConfig.addIgnoreBranchPatterns([argv.add]);
            (0, utils_1.logInfo)(`Added (${argv.add}) to be ignored`);
        }
        else if (argv.remove) {
            if (config_1.repoConfig.getIgnoreBranches().includes(argv.remove)) {
                config_1.repoConfig.removeIgnoreBranches(argv.remove);
                (0, utils_1.logInfo)(`Removed pattern (${argv.remove}) from ignore list`);
            }
            else {
                (0, utils_1.logInfo)(`No pattern matching (${argv.remove}) found.`);
            }
        }
        else {
            const ignoredBranches = config_1.repoConfig.getIgnoreBranches();
            if (ignoredBranches.length) {
                (0, utils_1.logInfo)(`The following patterns are being ignored by Graphite:`);
                (0, utils_1.logInfo)(ignoredBranches.join('\n'));
            }
            else {
                (0, utils_1.logInfo)('No ignored branches');
            }
        }
    }));
});
exports.handler = handler;
function findMatches(branchName) {
    return (0, utils_1.gpExecSync)({ command: `git branch --list '${branchName}'` })
        .toString()
        .trim();
}
//# sourceMappingURL=ignored_branches.js.map