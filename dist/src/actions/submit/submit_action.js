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
exports.submitAction = void 0;
const chalk_1 = __importDefault(require("chalk"));
const prompts_1 = __importDefault(require("prompts"));
const exec_state_config_1 = require("../../lib/config/exec_state_config");
const errors_1 = require("../../lib/errors");
const preconditions_1 = require("../../lib/preconditions");
const survey_1 = require("../../lib/telemetry/survey/survey");
const splog_1 = require("../../lib/utils/splog");
const prepare_branches_1 = require("./prepare_branches");
const push_branch_1 = require("./push_branch");
const submit_prs_1 = require("./submit_prs");
const validate_branches_1 = require("./validate_branches");
function submitAction(args, context) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        // Check CLI pre-condition to warn early
        const cliAuthToken = preconditions_1.cliAuthPrecondition(context);
        if (args.dryRun) {
            splog_1.logInfo(chalk_1.default.yellow(`Running submit in 'dry-run' mode. No branches will be pushed and no PRs will be opened or updated.`));
            splog_1.logNewline();
            args.editPRFieldsInline = false;
        }
        if (!exec_state_config_1.execStateConfig.interactive()) {
            args.editPRFieldsInline = false;
            args.reviewers = false;
            splog_1.logInfo(`Running in non-interactive mode. Inline prompts to fill PR fields will be skipped${args.draftToggle === undefined
                ? ' and new PRs will be created in draft mode'
                : ''}.`);
            splog_1.logNewline();
        }
        // args.branchesToSubmit is for the sync flow. Skips validation.
        const branchesToSubmit = (_a = args.branchesToSubmit) !== null && _a !== void 0 ? _a : (yield validate_branches_1.getValidBranchesToSubmit(args.scope, context));
        if (!branchesToSubmit) {
            return;
        }
        const submissionInfoWithBranches = yield prepare_branches_1.getPRInfoForBranches({
            branches: branchesToSubmit,
            editPRFieldsInline: args.editPRFieldsInline,
            draftToggle: args.draftToggle,
            updateOnly: args.updateOnly,
            reviewers: args.reviewers,
            dryRun: args.dryRun,
        }, context);
        if (yield shouldAbort(args.dryRun, args.confirm)) {
            return;
        }
        splog_1.logInfo(chalk_1.default.blueBright('📂 Pushing to remote and creating/updating PRs...'));
        for (const submissionInfoWithBranch of submissionInfoWithBranches) {
            push_branch_1.push(submissionInfoWithBranch.branch, context);
            yield submit_prs_1.submitPullRequest({ submissionInfoWithBranch, cliAuthToken }, context);
        }
        const survey = yield survey_1.getSurvey(context);
        if (survey) {
            yield survey_1.showSurvey(survey, context);
        }
    });
}
exports.submitAction = submitAction;
function shouldAbort(dryRun, confirm) {
    return __awaiter(this, void 0, void 0, function* () {
        if (dryRun) {
            splog_1.logInfo(chalk_1.default.blueBright('✅ Dry run complete.'));
            return true;
        }
        if (exec_state_config_1.execStateConfig.interactive() &&
            confirm &&
            !(yield prompts_1.default({
                type: 'confirm',
                name: 'value',
                message: 'Continue with this submit operation?',
                initial: true,
            }, {
                onCancel: () => {
                    throw new errors_1.KilledError();
                },
            })).value) {
            splog_1.logInfo(chalk_1.default.blueBright('🛑 Aborted submit.'));
            return true;
        }
        return false;
    });
}
//# sourceMappingURL=submit_action.js.map