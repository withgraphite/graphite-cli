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
exports.init = void 0;
const chalk_1 = __importDefault(require("chalk"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const prompts_1 = __importDefault(require("prompts"));
const config_1 = require("../lib/config");
const errors_1 = require("../lib/errors");
const preconditions_1 = require("../lib/preconditions");
const utils_1 = require("../lib/utils");
const trunk_1 = require("../lib/utils/trunk");
const branch_1 = __importDefault(require("../wrapper-classes/branch"));
function init(trunk, ignoreBranches) {
    return __awaiter(this, void 0, void 0, function* () {
        (0, preconditions_1.currentGitRepoPrecondition)();
        const allBranches = branch_1.default.allBranches();
        logWelcomeMessage();
        (0, utils_1.logNewline)();
        /**
         * When a branch new repo is created, it technically has 0 branches as a
         * branch doesn't become 'born' until it has a commit on it. In this case,
         * we exit early from init - which will continue to run and short-circuit
         * until the repo has a proper commit.
         *
         * https://newbedev.com/git-branch-not-returning-any-results
         */
        if (allBranches.length === 0) {
            (0, utils_1.logError)(`Ouch! We can't setup Graphite in a repo without any branches -- this is likely because you're initializing Graphite in a blank repo. Please create your first commit and then re-run your Graphite command.`);
            (0, utils_1.logNewline)();
            throw new errors_1.PreconditionsFailedError(`No branches found in current repo; cannot initialize Graphite.`);
        }
        // Trunk
        let newTrunkName;
        if (trunk) {
            if (branch_1.default.exists(trunk)) {
                newTrunkName = trunk;
                config_1.repoConfig.setTrunk(newTrunkName);
                (0, utils_1.logInfo)(`Trunk set to (${newTrunkName})`);
            }
            else {
                throw new errors_1.PreconditionsFailedError(`Cannot set (${trunk}) as trunk, branch not found in current repo.`);
            }
        }
        else {
            newTrunkName = yield selectTrunkBranch(allBranches);
            config_1.repoConfig.setTrunk(newTrunkName);
        }
        // Ignore Branches
        if (ignoreBranches) {
            ignoreBranches.forEach((branchName) => {
                if (!branch_1.default.exists(branchName)) {
                    throw new errors_1.PreconditionsFailedError(`Cannot set (${branchName}) to be ignore, branch not found in current repo.`);
                }
            });
            config_1.repoConfig.addIgnoreBranchPatterns(ignoreBranches);
        }
        else {
            const ignoreBranches = yield selectIgnoreBranches(allBranches, newTrunkName);
            (0, utils_1.logInfo)(`Selected following branches to ignore: ${ignoreBranches}`);
            config_1.repoConfig.addIgnoreBranchPatterns(ignoreBranches);
        }
        (0, utils_1.logInfo)(`Graphite repo config saved at "${config_1.repoConfig.path()}"`);
        (0, utils_1.logInfo)(fs_extra_1.default.readFileSync(config_1.repoConfig.path()).toString());
    });
}
exports.init = init;
function logWelcomeMessage() {
    if (!config_1.repoConfig.graphiteInitialized()) {
        (0, utils_1.logInfo)('Welcome to Graphite!');
    }
    else {
        (0, utils_1.logInfo)(`Regenerating Graphite repo config (${config_1.repoConfig.path()})`);
    }
}
function selectIgnoreBranches(allBranches, trunk) {
    return __awaiter(this, void 0, void 0, function* () {
        const branchesWithoutTrunk = allBranches.filter((b) => b.name != trunk);
        if (branchesWithoutTrunk.length === 0) {
            return [];
        }
        const response = yield (0, prompts_1.default)({
            type: 'multiselect',
            name: 'branches',
            message: `Ignore Branches: select any permanent branches never to be stacked (such as "prod" or "staging"). ${chalk_1.default.yellow('Fine to select none.')}`,
            choices: branchesWithoutTrunk.map((b) => {
                return { title: b.name, value: b.name };
            }),
        });
        return response.branches;
    });
}
function selectTrunkBranch(allBranches) {
    return __awaiter(this, void 0, void 0, function* () {
        const trunk = (0, trunk_1.inferTrunk)();
        const response = yield (0, prompts_1.default)(Object.assign({ type: 'autocomplete', name: 'branch', message: `Select a trunk branch, which you open PR's against${trunk ? ` [infered trunk (${chalk_1.default.green(trunk.name)})]` : ''}`, choices: allBranches.map((b) => {
                return { title: b.name, value: b.name };
            }) }, (trunk ? { initial: trunk.name } : {})));
        return response.branch;
    });
}
//# sourceMappingURL=init.js.map