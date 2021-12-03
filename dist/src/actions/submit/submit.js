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
exports.saveBranchPRInfo = exports.submitBranches = exports.submitAction = void 0;
const graphite_cli_routes_1 = __importDefault(require("@screenplaydev/graphite-cli-routes"));
const retyped_routes_1 = require("@screenplaydev/retyped-routes");
const chalk_1 = __importDefault(require("chalk"));
const api_1 = require("../../lib/api");
const config_1 = require("../../lib/config");
const errors_1 = require("../../lib/errors");
const preconditions_1 = require("../../lib/preconditions");
const pr_info_1 = require("../../lib/sync/pr_info");
const survey_1 = require("../../lib/telemetry/survey/survey");
const utils_1 = require("../../lib/utils");
const wrapper_classes_1 = require("../../wrapper-classes");
const branch_1 = __importDefault(require("../../wrapper-classes/branch"));
const validate_1 = require("./../validate");
const pr_body_1 = require("./pr_body");
const pr_draft_1 = require("./pr_draft");
const pr_title_1 = require("./pr_title");
function submitAction(args) {
    return __awaiter(this, void 0, void 0, function* () {
        if (args.dryRun) {
            utils_1.logInfo(chalk_1.default.yellow(`Running submit in 'dry-run' mode. No branches will be pushed and no PRs will be opened or updated.`));
            utils_1.logNewline();
        }
        if (!config_1.execStateConfig.interactive()) {
            args.editPRFieldsInline = false;
            args.createNewPRsAsDraft = true;
        }
        const cliAuthToken = preconditions_1.cliAuthPrecondition();
        const repoName = config_1.repoConfig.getRepoName();
        const repoOwner = config_1.repoConfig.getRepoOwner();
        try {
            // In order to keep the step numbering consistent between the branch and
            // stack submit cases, always print the below status. We can think of this
            // as the validation just always passing in the branch case.
            //
            // Two spaces between the text and icon is intentional for spacing
            // purposes.
            utils_1.logInfo(chalk_1.default.blueBright(`✏️  [1/4] Validating Graphite stack before submitting...`));
            if (args.scope !== "BRANCH") {
                validate_1.validate(args.scope);
            }
            utils_1.logNewline();
        }
        catch (_a) {
            throw new errors_1.ValidationFailedError(`Validation failed before submitting.`);
        }
        const branchesToSubmit = getBranchesToSubmit({
            currentBranch: preconditions_1.currentBranchPrecondition(),
            scope: args.scope,
        });
        // Force a sync to link any PRs that have remote equivalents, but weren't
        // previously tracked with Graphite.
        yield pr_info_1.syncPRInfoForBranches(branchesToSubmit);
        utils_1.logInfo(chalk_1.default.blueBright("🥞 [2/4] Preparing to submit PRs for the following branches..."));
        branchesToSubmit.forEach((branch) => {
            let operation;
            if (branch.getPRInfo() !== undefined) {
                operation = "update";
            }
            else {
                operation = "create";
            }
            utils_1.logInfo(`▸ ${chalk_1.default.yellow(branch.name)} (${operation})`);
        });
        utils_1.logNewline();
        if (!args.dryRun) {
            yield submitBranches({
                branchesToSubmit: branchesToSubmit,
                cliAuthToken: cliAuthToken,
                repoOwner: repoOwner,
                repoName: repoName,
                editPRFieldsInline: args.editPRFieldsInline,
                createNewPRsAsDraft: args.createNewPRsAsDraft,
            });
        }
    });
}
exports.submitAction = submitAction;
function getBranchesToSubmit(args) {
    let branches = [];
    switch (args.scope) {
        case "DOWNSTACK":
            branches = new wrapper_classes_1.MetaStackBuilder()
                .downstackFromBranch(args.currentBranch)
                .branches();
            break;
        case "FULLSTACK":
            branches = new wrapper_classes_1.MetaStackBuilder()
                .fullStackFromBranch(args.currentBranch)
                .branches();
            break;
        case "UPSTACK":
            branches = new wrapper_classes_1.MetaStackBuilder()
                .upstackInclusiveFromBranchWithParents(args.currentBranch)
                .branches();
            break;
        case "BRANCH":
            branches = [args.currentBranch];
            break;
        default:
            assertUnreachable(args.scope);
            branches = [];
    }
    return branches
        .filter((b) => !b.isTrunk())
        .filter((b) => { var _a; return ((_a = b.getPRInfo()) === null || _a === void 0 ? void 0 : _a.state) !== "MERGED"; });
}
function submitBranches(args) {
    return __awaiter(this, void 0, void 0, function* () {
        const submissionInfoWithBranches = yield getPRInfoForBranches({
            branches: args.branchesToSubmit,
            cliAuthToken: args.cliAuthToken,
            repoOwner: args.repoOwner,
            repoName: args.repoName,
            editPRFieldsInline: args.editPRFieldsInline,
            createNewPRsAsDraft: args.createNewPRsAsDraft,
        });
        const branchesPushedToRemote = pushBranchesToRemote(submissionInfoWithBranches.map((info) => info.branch));
        // Filter out PRs which don't actually need a new submission (i.e. they
        // had no local code changes and their local base did not change).
        const submissionInfo = submissionInfoWithBranches.filter((info) => {
            const prInfo = info.branch.getPRInfo();
            if (prInfo === undefined) {
                return true;
            }
            return shouldUpdatePR({
                branch: info.branch,
                previousBranchPRInfo: prInfo,
                branchesPushedToRemote: branchesPushedToRemote,
            });
        });
        const [prInfo, survey] = yield Promise.all([
            submitPRsForBranches({
                submissionInfo: submissionInfo,
                branchesPushedToRemote: branchesPushedToRemote,
                cliAuthToken: args.cliAuthToken,
                repoOwner: args.repoOwner,
                repoName: args.repoName,
                editPRFieldsInline: args.editPRFieldsInline,
                createNewPRsAsDraft: args.createNewPRsAsDraft,
            }),
            survey_1.getSurvey(),
        ]);
        saveBranchPRInfo(prInfo);
        printSubmittedPRInfo(prInfo);
        if (survey !== undefined) {
            yield survey_1.showSurvey(survey);
        }
    });
}
exports.submitBranches = submitBranches;
function getPRInfoForBranches(args) {
    return __awaiter(this, void 0, void 0, function* () {
        const branchPRInfo = [];
        for (const branch of args.branches) {
            // The branch here should always have a parent - above, the branches we've
            // gathered should exclude trunk which ensures that every branch we're submitting
            // a PR for has a valid parent.
            const parentBranchName = getBranchBaseName(branch);
            const previousPRInfo = branch.getPRInfo();
            if (previousPRInfo === undefined) {
                const { title, body, draft } = yield getPRCreationInfo({
                    branch: branch,
                    parentBranchName: parentBranchName,
                    editPRFieldsInline: args.editPRFieldsInline,
                    createNewPRsAsDraft: args.createNewPRsAsDraft,
                });
                branchPRInfo.push({
                    action: "create",
                    head: branch.name,
                    base: parentBranchName,
                    title: title,
                    body: body,
                    draft: draft,
                    branch: branch,
                });
            }
            else {
                branchPRInfo.push({
                    action: "update",
                    head: branch.name,
                    base: parentBranchName,
                    prNumber: previousPRInfo.number,
                    branch: branch,
                });
            }
        }
        return branchPRInfo;
    });
}
function pushBranchesToRemote(branches) {
    const branchesPushedToRemote = [];
    // Two spaces between the text and icon is intentional for spacing purposes.
    utils_1.logInfo(chalk_1.default.blueBright("➡️  [3/4] Pushing branches to remote..."));
    branches.forEach((branch) => {
        utils_1.logInfo(`Pushing ${branch.name}...`);
        const output = utils_1.gpExecSync({
            // redirecting stderr to stdout here because 1) git prints the output
            // of the push command to stderr 2) we want to analyze it but Node's
            // execSync makes analyzing stderr extremely challenging
            command: `git push origin -f ${branch.name} 2>&1`,
            options: {
                printStdout: true,
            },
        }, (err) => {
            throw new errors_1.ExitFailedError(`Failed to push changes for ${branch.name} to origin. Aborting...`, err);
        })
            .toString()
            .trim();
        if (!output.includes("Everything up-to-date")) {
            branchesPushedToRemote.push(branch);
        }
    });
    return branchesPushedToRemote;
}
function submitPRsForBranches(args) {
    return __awaiter(this, void 0, void 0, function* () {
        const submissionInfo = args.submissionInfo;
        if (submissionInfo.length === 0) {
            return [];
        }
        try {
            utils_1.logInfo(chalk_1.default.blueBright(`📂 [4/4] Opening/updating PRs on GitHub for pushed branches...`));
            const response = yield retyped_routes_1.request.requestWithArgs(api_1.API_SERVER, graphite_cli_routes_1.default.submitPullRequests, {
                authToken: args.cliAuthToken,
                repoOwner: args.repoOwner,
                repoName: args.repoName,
                prs: submissionInfo,
            });
            if (response._response.status === 200 && response._response.body !== null) {
                const requests = {};
                submissionInfo.forEach((prRequest) => {
                    requests[prRequest.head] = prRequest;
                });
                return response.prs.map((prResponse) => {
                    return {
                        request: requests[prResponse.head],
                        response: prResponse,
                    };
                });
            }
            if (response._response.status === 401) {
                throw new errors_1.PreconditionsFailedError("invalid/expired Graphite auth token.\n\nPlease obtain a new auth token by visiting https://app.graphite.dev/activate.");
            }
            throw new errors_1.ExitFailedError(`unexpected server response (${response._response.status}).\n\nResponse: ${JSON.stringify(response)}`);
        }
        catch (error) {
            throw new errors_1.ExitFailedError(`Failed to submit PRs`, error);
        }
    });
}
function getBranchBaseName(branch) {
    const parent = branch.getParentFromMeta();
    if (parent === undefined) {
        throw new errors_1.PreconditionsFailedError(`Could not find parent for branch ${branch.name} to submit PR against. Please checkout ${branch.name} and run \`gt upstack onto <parent_branch>\` to set its parent.`);
    }
    return parent.name;
}
/**
 * For now, we only allow users to update the following PR properties which
 * necessitate a PR update:
 * - the PR base
 * - the PR's code contents
 *
 * Notably, we do not yet allow users to update the PR title, body, etc.
 *
 * Therefore, we should only update the PR iff either of these properties
 * differ from our stored data on the previous PR submission.
 */
function shouldUpdatePR(args) {
    // base was updated
    if (getBranchBaseName(args.branch) !== args.previousBranchPRInfo.base) {
        return true;
    }
    // code was updated
    if (args.branchesPushedToRemote.find((branchPushedToRemote) => branchPushedToRemote.name === args.branch.name)) {
        return true;
    }
    if (config_1.execStateConfig.outputDebugLogs()) {
        utils_1.logInfo(`No PR update needed for ${args.branch.name}: PR base and code unchanged.`);
    }
    return false;
}
function getPRCreationInfo(args) {
    return __awaiter(this, void 0, void 0, function* () {
        utils_1.logInfo(`Enter info for new pull request for ${chalk_1.default.yellow(args.branch.name)} ▸ ${args.parentBranchName}:`);
        const title = yield pr_title_1.getPRTitle({
            branch: args.branch,
            editPRFieldsInline: args.editPRFieldsInline,
        });
        args.branch.setPriorSubmitTitle(title);
        const body = yield pr_body_1.getPRBody({
            branch: args.branch,
            editPRFieldsInline: args.editPRFieldsInline,
        });
        args.branch.setPriorSubmitBody(body);
        const createAsDraft = yield pr_draft_1.getPRDraftStatus({
            createNewPRsAsDraft: args.createNewPRsAsDraft,
        });
        // Log newline at the end to create some visual separation to the next
        // interactive PR section or status output.
        utils_1.logNewline();
        return {
            title: title,
            body: body,
            draft: createAsDraft,
        };
    });
}
function printSubmittedPRInfo(prs) {
    if (prs.length === 0) {
        utils_1.logInfo("All PRs up-to-date on GitHub; no PR updates necessary.");
        return;
    }
    prs.forEach((pr) => {
        utils_1.logSuccess(pr.response.head);
        let status = pr.response.status;
        switch (pr.response.status) {
            case "updated":
                status = chalk_1.default.yellow(status);
                break;
            case "created":
                status = chalk_1.default.green(status);
                break;
            case "error":
                status = chalk_1.default.red(status);
                break;
            default:
                assertUnreachable(pr.response);
        }
        if ("error" in pr.response) {
            utils_1.logError(pr.response.error);
        }
        else {
            console.log(`${pr.response.prURL} (${status})`);
        }
    });
}
function saveBranchPRInfo(prs) {
    prs.forEach((pr) => __awaiter(this, void 0, void 0, function* () {
        if (pr.response.status === "updated" || pr.response.status === "created") {
            const branch = yield branch_1.default.branchWithName(pr.response.head);
            branch.setPRInfo({
                number: pr.response.prNumber,
                url: pr.response.prURL,
                base: pr.request.base,
            });
        }
    }));
}
exports.saveBranchPRInfo = saveBranchPRInfo;
// eslint-disable-next-line @typescript-eslint/no-empty-function
function assertUnreachable(arg) { }
//# sourceMappingURL=submit.js.map