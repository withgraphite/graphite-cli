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
exports.checkForEmptyBranches = exports.getValidBranchesToSubmit = void 0;
const chalk_1 = __importDefault(require("chalk"));
const prompts_1 = __importDefault(require("prompts"));
const exec_state_config_1 = require("../../lib/config/exec_state_config");
const errors_1 = require("../../lib/errors");
const preconditions_1 = require("../../lib/preconditions");
const pr_info_1 = require("../../lib/sync/pr_info");
const utils_1 = require("../../lib/utils");
const is_empty_branch_1 = require("../../lib/utils/is_empty_branch");
const validate_1 = require("../validate");
function getValidBranchesToSubmit(scope, context) {
    return __awaiter(this, void 0, void 0, function* () {
        utils_1.logInfo(chalk_1.default.blueBright(`✏️  [Step 1] Validating that this Graphite stack is ready to submit...`));
        const branchesToSubmit = getAllBranchesToSubmit(scope, context);
        utils_1.logNewline();
        yield pr_info_1.syncPRInfoForBranches(branchesToSubmit, context);
        return hasAnyMergedBranches(branchesToSubmit) ||
            hasAnyClosedBranches(branchesToSubmit)
            ? []
            : yield checkForEmptyBranches(branchesToSubmit, context);
    });
}
exports.getValidBranchesToSubmit = getValidBranchesToSubmit;
function getAllBranchesToSubmit(scope, context) {
    if (scope === 'BRANCH') {
        return [preconditions_1.currentBranchPrecondition(context)];
    }
    try {
        return validate_1.validate(scope, context);
    }
    catch (_a) {
        throw new errors_1.ValidationFailedError(`Validation failed. Will not submit.`);
    }
}
function hasAnyMergedBranches(branchesToSubmit) {
    const mergedBranches = branchesToSubmit.filter((b) => { var _a; return ((_a = b.getPRInfo()) === null || _a === void 0 ? void 0 : _a.state) === 'MERGED'; });
    if (mergedBranches.length === 0) {
        return false;
    }
    const hasMultipleBranches = mergedBranches.length > 1;
    utils_1.logError(`PR${hasMultipleBranches ? 's' : ''} for the following branch${hasMultipleBranches ? 'es have' : ' has'} already been merged:`);
    mergedBranches.forEach((b) => utils_1.logError(`▸ ${chalk_1.default.reset(b.name)}`));
    utils_1.logError(`If this is expected, you can use 'gt repo sync' to delete ${hasMultipleBranches ? 'these branches' : 'this branch'} locally and restack dependencies.`);
    return true;
}
function hasAnyClosedBranches(branchesToSubmit) {
    const closedBranches = branchesToSubmit.filter((b) => { var _a; return ((_a = b.getPRInfo()) === null || _a === void 0 ? void 0 : _a.state) === 'CLOSED'; });
    if (closedBranches.length === 0) {
        return false;
    }
    const hasMultipleBranches = closedBranches.length > 1;
    utils_1.logError(`PR${hasMultipleBranches ? 's' : ''} for the following branch${hasMultipleBranches ? 'es have' : ' has'} been closed:`);
    closedBranches.forEach((b) => utils_1.logError(`▸ ${chalk_1.default.reset(b.name)}`));
    utils_1.logError(`To submit ${hasMultipleBranches ? 'these branches' : 'this branch'}, please reopen the PR remotely.`);
    return true;
}
function checkForEmptyBranches(submittableBranches, context) {
    return __awaiter(this, void 0, void 0, function* () {
        const emptyBranches = submittableBranches.filter((branch) => is_empty_branch_1.isEmptyBranch(branch.name, getBranchBaseName(branch, context)));
        if (emptyBranches.length === 0) {
            return submittableBranches;
        }
        const hasMultipleBranches = emptyBranches.length > 1;
        utils_1.logWarn(`The following branch${hasMultipleBranches ? 'es have' : ' has'} no changes:`);
        emptyBranches.forEach((b) => utils_1.logWarn(`▸ ${chalk_1.default.reset(b.name)}`));
        utils_1.logWarn(`Are you sure you want to submit ${hasMultipleBranches ? 'them' : 'it'}?`);
        utils_1.logNewline();
        if (!exec_state_config_1.execStateConfig.interactive()) {
            return [];
        }
        const response = yield prompts_1.default({
            type: 'select',
            name: 'empty_branches_options',
            message: `How would you like to proceed?`,
            choices: [
                {
                    title: `Abort command and keep working on ${hasMultipleBranches ? 'these branches' : 'this branch'}`,
                    value: 'fix_manually',
                },
                {
                    title: `Continue with empty branch${hasMultipleBranches ? 'es' : ''}`,
                    value: 'continue_empty',
                },
            ],
        }, {
            onCancel: () => {
                throw new errors_1.KilledError();
            },
        });
        utils_1.logNewline();
        return response.empty_branches_options === 'continue_empty'
            ? submittableBranches
            : [];
    });
}
exports.checkForEmptyBranches = checkForEmptyBranches;
function getBranchBaseName(branch, context) {
    const parent = branch.getParentFromMeta(context);
    if (parent === undefined) {
        throw new errors_1.PreconditionsFailedError(`Could not find parent for branch ${branch.name} to submit PR against. Please checkout ${branch.name} and run \`gt upstack onto <parent_branch>\` to set its parent.`);
    }
    return parent.name;
}
//# sourceMappingURL=validate_branches.js.map