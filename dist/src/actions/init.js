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
const errors_1 = require("../lib/errors");
const preconditions_1 = require("../lib/preconditions");
const utils_1 = require("../lib/utils");
const trunk_1 = require("../lib/utils/trunk");
const branch_1 = __importDefault(require("../wrapper-classes/branch"));
function init(context, trunk, ignoreBranches) {
    return __awaiter(this, void 0, void 0, function* () {
        preconditions_1.currentGitRepoPrecondition();
        const allBranches = branch_1.default.allBranches(context);
        logWelcomeMessage(context);
        utils_1.logNewline();
        /**
         * When a branch new repo is created, it technically has 0 branches as a
         * branch doesn't become 'born' until it has a commit on it. In this case,
         * we exit early from init - which will continue to run and short-circuit
         * until the repo has a proper commit.
         *
         * https://newbedev.com/git-branch-not-returning-any-results
         */
        if (allBranches.length === 0) {
            utils_1.logError(`Ouch! We can't setup Graphite in a repo without any branches -- this is likely because you're initializing Graphite in a blank repo. Please create your first commit and then re-run your Graphite command.`);
            utils_1.logNewline();
            throw new errors_1.PreconditionsFailedError(`No branches found in current repo; cannot initialize Graphite.`);
        }
        // Trunk
        let newTrunkName;
        if (trunk) {
            if (branch_1.default.exists(trunk)) {
                newTrunkName = trunk;
                context.repoConfig.setTrunk(newTrunkName);
                utils_1.logInfo(`Trunk set to (${newTrunkName})`);
            }
            else {
                throw new errors_1.PreconditionsFailedError(`Cannot set (${trunk}) as trunk, branch not found in current repo.`);
            }
        }
        else {
            newTrunkName = yield selectTrunkBranch(allBranches, context);
            context.repoConfig.setTrunk(newTrunkName);
        }
        // Ignore Branches
        if (ignoreBranches) {
            ignoreBranches.forEach((branchName) => {
                if (!branch_1.default.exists(branchName)) {
                    throw new errors_1.PreconditionsFailedError(`Cannot set (${branchName}) to be ignore, branch not found in current repo.`);
                }
            });
            context.repoConfig.addIgnoreBranchPatterns(ignoreBranches);
        }
        else {
            let ignoreBranches = yield selectIgnoreBranches(allBranches, newTrunkName);
            utils_1.logInfo(`Selected following branches to ignore: ${ignoreBranches}`);
            if (!ignoreBranches) {
                ignoreBranches = [];
            }
            context.repoConfig.addIgnoreBranchPatterns(ignoreBranches);
        }
        utils_1.logInfo(`Graphite repo config saved at "${context.repoConfig.path}"`);
        utils_1.logInfo(fs_extra_1.default.readFileSync(context.repoConfig.path).toString());
    });
}
exports.init = init;
function logWelcomeMessage(context) {
    if (!context.repoConfig.graphiteInitialized()) {
        utils_1.logInfo('Welcome to Graphite!');
    }
    else {
        utils_1.logInfo(`Regenerating Graphite repo config (${context.repoConfig.path})`);
    }
}
function selectIgnoreBranches(allBranches, trunk) {
    return __awaiter(this, void 0, void 0, function* () {
        const branchesWithoutTrunk = allBranches.filter((b) => b.name != trunk);
        if (branchesWithoutTrunk.length === 0) {
            return [];
        }
        const response = yield prompts_1.default({
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
function selectTrunkBranch(allBranches, context) {
    return __awaiter(this, void 0, void 0, function* () {
        const trunk = trunk_1.inferTrunk(context);
        const response = yield prompts_1.default(Object.assign({ type: 'autocomplete', name: 'branch', message: `Select a trunk branch, which you open pull requests against${trunk ? ` [inferred trunk (${chalk_1.default.green(trunk.name)})]` : ''}`, choices: allBranches.map((b) => {
                return { title: b.name, value: b.name };
            }) }, (trunk ? { initial: trunk.name } : {})));
        return response.branch;
    });
}
//# sourceMappingURL=init.js.map