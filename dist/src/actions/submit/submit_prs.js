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
exports.submitPullRequests = void 0;
const graphite_cli_routes_1 = __importDefault(require("@withgraphite/graphite-cli-routes"));
const retyped_routes_1 = require("@withgraphite/retyped-routes");
const chalk_1 = __importDefault(require("chalk"));
const api_1 = require("../../lib/api");
const errors_1 = require("../../lib/errors");
const splog_1 = require("../../lib/utils/splog");
const branch_1 = require("../../wrapper-classes/branch");
function submitPullRequests(args, context) {
    return __awaiter(this, void 0, void 0, function* () {
        splog_1.logInfo(chalk_1.default.blueBright(`📂 [Step 4] Opening/updating PRs on GitHub for pushed branches...`));
        if (!args.submissionInfoWithBranches.length) {
            splog_1.logInfo(`No eligible branches to create/update PRs for.`);
            splog_1.logNewline();
            return;
        }
        const prInfo = yield requestServerToSubmitPRs(args.cliAuthToken, args.submissionInfoWithBranches, context);
        saveBranchPRInfo(prInfo, context);
        printSubmittedPRInfo(prInfo);
    });
}
exports.submitPullRequests = submitPullRequests;
const SUCCESS_RESPONSE_CODE = 200;
const UNAUTHORIZED_RESPONSE_CODE = 401;
function requestServerToSubmitPRs(cliAuthToken, submissionInfo, context) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield retyped_routes_1.request.requestWithArgs(api_1.API_SERVER, graphite_cli_routes_1.default.submitPullRequests, {
                authToken: cliAuthToken,
                repoOwner: context.repoConfig.getRepoOwner(),
                repoName: context.repoConfig.getRepoName(),
                prs: submissionInfo,
            });
            if (response._response.status === SUCCESS_RESPONSE_CODE &&
                response._response.body) {
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
            else if (response._response.status === UNAUTHORIZED_RESPONSE_CODE) {
                throw new errors_1.PreconditionsFailedError('Your Graphite auth token is invalid/expired.\n\nPlease obtain a new auth token by visiting https://app.graphite.dev/activate.');
            }
            else {
                throw new errors_1.ExitFailedError(`unexpected server response (${response._response.status}).\n\nResponse: ${JSON.stringify(response)}`);
            }
        }
        catch (error) {
            throw new errors_1.ExitFailedError(`Failed to submit PRs`, error);
        }
    });
}
function printSubmittedPRInfo(prs) {
    if (!prs.length) {
        splog_1.logNewline();
        splog_1.logInfo(chalk_1.default.blueBright('✅ All PRs up-to-date on GitHub; no updates necessary.'));
        splog_1.logNewline();
        return;
    }
    prs.forEach((pr) => {
        if ('error' in pr.response) {
            splog_1.logError(`Error in submitting ${pr.response.head}: ${pr.response.error}`);
        }
        else {
            splog_1.logInfo(`${chalk_1.default.green(pr.response.head)}: ${pr.response.prURL} (${{
                updated: chalk_1.default.yellow,
                created: chalk_1.default.green,
                error: chalk_1.default.red,
            }[pr.response.status](pr.response.status)})`);
        }
    });
    splog_1.logNewline();
}
function saveBranchPRInfo(prs, context) {
    prs
        .filter((pr) => pr.response.status === 'created' || pr.response.status === 'updated')
        .forEach((pr) => {
        const branch = branch_1.Branch.branchWithName(pr.response.head, context);
        branch.upsertPRInfo(Object.assign(Object.assign({ number: pr.response.prNumber, url: pr.response.prURL, base: pr.request.base, state: 'OPEN' }, (pr.request.action === 'create'
            ? {
                title: pr.request.title,
                body: pr.request.body,
                reviewDecision: 'REVIEW_REQUIRED', // Because we just opened this PR
            }
            : {})), (pr.request.draft !== undefined ? { draft: pr.request.draft } : {})));
    });
}
//# sourceMappingURL=submit_prs.js.map