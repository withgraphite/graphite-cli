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
exports.handlePRReponse = exports.requestServerToSubmitPRs = exports.submitPullRequest = void 0;
const graphite_cli_routes_1 = __importDefault(require("@withgraphite/graphite-cli-routes"));
const retyped_routes_1 = require("@withgraphite/retyped-routes");
const chalk_1 = __importDefault(require("chalk"));
const api_1 = require("../../lib/api");
const errors_1 = require("../../lib/errors");
const branch_1 = require("../../wrapper-classes/branch");
function submitPullRequest(args, context) {
    return __awaiter(this, void 0, void 0, function* () {
        const { errorMessage } = handlePRReponse((yield requestServerToSubmitPRs(args.cliAuthToken, [args.submissionInfoWithBranch], context))[0], context);
        if (errorMessage) {
            throw new errors_1.ExitFailedError(errorMessage);
        }
    });
}
exports.submitPullRequest = submitPullRequest;
const SUCCESS_RESPONSE_CODE = 200;
const UNAUTHORIZED_RESPONSE_CODE = 401;
// This endpoint is plural for legacy reasons.
// Leaving the function plural in case we want to revert.
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
            throw new errors_1.ExitFailedError(`Failed to submit PR${submissionInfo.length > 1 ? 's' : ''}`, error);
        }
    });
}
exports.requestServerToSubmitPRs = requestServerToSubmitPRs;
function handlePRReponse(pr, context) {
    if (pr.response.status === 'error') {
        return {
            errorMessage: `Error in submitting ${pr.response.head}: ${pr.response.error}`,
        };
    }
    branch_1.Branch.branchWithName(pr.response.head).upsertPRInfo(Object.assign(Object.assign({ number: pr.response.prNumber, url: pr.response.prURL, base: pr.request.base, state: 'OPEN' }, (pr.request.action === 'create'
        ? {
            title: pr.request.title,
            body: pr.request.body,
            reviewDecision: 'REVIEW_REQUIRED', // Because we just opened this PR
        }
        : {})), (pr.request.draft !== undefined ? { draft: pr.request.draft } : {})));
    context.splog.logInfo(`${chalk_1.default.green(pr.response.head)}: ${pr.response.prURL} (${{
        updated: chalk_1.default.yellow,
        created: chalk_1.default.green,
    }[pr.response.status](pr.response.status)})`);
    return {};
}
exports.handlePRReponse = handlePRReponse;
//# sourceMappingURL=submit_prs.js.map