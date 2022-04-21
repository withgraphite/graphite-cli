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
const exec_state_config_1 = require("../../lib/config/exec_state_config");
const preconditions_1 = require("../../lib/preconditions");
const survey_1 = require("../../lib/telemetry/survey/survey");
const utils_1 = require("../../lib/utils");
const prepare_branches_1 = require("./prepare_branches");
const push_branches_1 = require("./push_branches");
const push_metadata_1 = require("./push_metadata");
const submit_prs_1 = require("./submit_prs");
const validate_branches_1 = require("./validate_branches");
function submitAction(args, context) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        // Check CLI pre-condition to warn early
        const cliAuthToken = preconditions_1.cliAuthPrecondition(context);
        if (args.dryRun) {
            utils_1.logInfo(chalk_1.default.yellow(`Running submit in 'dry-run' mode. No branches will be pushed and no PRs will be opened or updated.`));
            utils_1.logNewline();
            args.editPRFieldsInline = false;
        }
        if (!exec_state_config_1.execStateConfig.interactive()) {
            utils_1.logInfo(`Running in non-interactive mode. All new PRs will be created as draft and PR fields inline prompt will be silenced`);
            args.editPRFieldsInline = false;
            args.draftToggle = true;
        }
        // Step 1: Validate
        // args.branchesToSubmit is for the sync flow. Skips Steps 1.
        const branchesToSubmit = (_a = args.branchesToSubmit) !== null && _a !== void 0 ? _a : (yield validate_branches_1.getValidBranchesToSubmit(args.scope, context));
        if (!branchesToSubmit) {
            return;
        }
        // Step 2: Prepare
        const submissionInfoWithBranches = yield prepare_branches_1.getPRInfoForBranches({
            branches: branchesToSubmit,
            editPRFieldsInline: args.editPRFieldsInline,
            draftToggle: args.draftToggle,
            updateOnly: args.updateOnly,
            reviewers: args.reviewers,
            dryRun: args.dryRun,
        }, context);
        if (args.dryRun) {
            utils_1.logInfo(chalk_1.default.blueBright('✅ Dry Run complete.'));
            return;
        }
        // Step 3: Push
        const branchesPushedToRemote = push_branches_1.pushBranchesToRemote(submissionInfoWithBranches.map((info) => info.branch), context);
        // Step 4: Submit
        yield submit_prs_1.submitPullRequests({
            submissionInfoWithBranches: submissionInfoWithBranches,
            cliAuthToken: cliAuthToken,
        }, context);
        // Step 5: Metadata
        yield push_metadata_1.pushMetadata(branchesPushedToRemote);
        const survey = yield survey_1.getSurvey(context);
        if (survey) {
            yield survey_1.showSurvey(survey, context);
        }
    });
}
exports.submitAction = submitAction;
//# sourceMappingURL=submit.js.map