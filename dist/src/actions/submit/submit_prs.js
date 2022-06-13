"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.submitPullRequest = void 0;
const graphite_cli_routes_1 = __importDefault(require("@withgraphite/graphite-cli-routes"));
const retyped_routes_1 = require("@withgraphite/retyped-routes");
const chalk_1 = __importDefault(require("chalk"));
const server_1 = require("../../lib/api/server");
const errors_1 = require("../../lib/errors");
const cute_string_1 = require("../../lib/utils/cute_string");
async function submitPullRequest(args, context) {
    const { errorMessage } = handlePRReponse((await requestServerToSubmitPRs(args.cliAuthToken, args.submissionInfo, context))[0], context);
    if (errorMessage) {
        throw new errors_1.ExitFailedError(errorMessage);
    }
}
exports.submitPullRequest = submitPullRequest;
const SUCCESS_RESPONSE_CODE = 200;
const UNAUTHORIZED_RESPONSE_CODE = 401;
// This endpoint is plural for legacy reasons.
// Leaving the function plural in case we want to revert.
async function requestServerToSubmitPRs(cliAuthToken, submissionInfo, context) {
    try {
        const response = await retyped_routes_1.request.requestWithArgs(server_1.API_SERVER, graphite_cli_routes_1.default.submitPullRequests, {
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
            throw new errors_1.ExitFailedError(`unexpected server response (${response._response.status}).\n\nResponse: ${(0, cute_string_1.cuteString)(response)}`);
        }
    }
    catch (error) {
        throw new errors_1.ExitFailedError(`Failed to submit PR${submissionInfo.length > 1 ? 's' : ''}`, error);
    }
}
function handlePRReponse(pr, context) {
    if (pr.response.status === 'error') {
        return {
            errorMessage: `Error in submitting ${pr.response.head}: ${pr.response.error}`,
        };
    }
    context.metaCache.upsertPrInfo(pr.response.head, {
        number: pr.response.prNumber,
        url: pr.response.prURL,
        base: pr.request.base,
        state: 'OPEN',
        ...(pr.request.action === 'create'
            ? {
                title: pr.request.title,
                body: pr.request.body,
                reviewDecision: 'REVIEW_REQUIRED', // Because we just opened this PR
            }
            : {}),
        ...(pr.request.draft !== undefined ? { draft: pr.request.draft } : {}),
    });
    context.splog.info(`${chalk_1.default.green(pr.response.head)}: ${pr.response.prURL} (${{
        updated: chalk_1.default.yellow,
        created: chalk_1.default.green,
    }[pr.response.status](pr.response.status)})`);
    return {};
}
//# sourceMappingURL=submit_prs.js.map