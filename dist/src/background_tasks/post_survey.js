"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.postSurveyResponse = exports.postSurveyResponsesInBackground = void 0;
const graphite_cli_routes_1 = require("@withgraphite/graphite-cli-routes");
const retyped_routes_1 = require("@withgraphite/retyped-routes");
const server_1 = require("../lib/api/server");
const survey_responses_spf_1 = require("../lib/spiffy/survey_responses_spf");
const user_config_spf_1 = require("../lib/spiffy/user_config_spf");
const spawn_1 = require("../lib/utils/spawn");
// We try to post the survey response right after the user takes it, but in
// case they quit early or there's some error, we'll continue to try to post
// it in the future until it succeeds.
function postSurveyResponsesInBackground(context) {
    // We don't worry about race conditions here - we can dedup on the server.
    if (context.surveyConfig.hasSurveyResponse()) {
        (0, spawn_1.spawnDetached)(__filename);
    }
}
exports.postSurveyResponsesInBackground = postSurveyResponsesInBackground;
async function postSurveyResponse() {
    try {
        const surveyConfig = survey_responses_spf_1.surveyConfigFactory.loadIfExists();
        const surveyResponse = surveyConfig?.data.responses;
        const authToken = user_config_spf_1.userConfigFactory.loadIfExists()?.data.authToken;
        if (!surveyConfig || !surveyResponse || !authToken) {
            return;
        }
        const response = await retyped_routes_1.request.requestWithArgs(server_1.API_SERVER, graphite_cli_routes_1.API_ROUTES.surveyResponse, {
            authToken: authToken,
            responses: {
                timestamp: surveyResponse.timestamp,
                responses: surveyResponse.responses.map((qa) => {
                    return {
                        question: qa.question,
                        response: qa.answer,
                    };
                }),
                exitedEarly: surveyResponse.exitedEarly,
            },
        });
        if (response._response.status === 200) {
            surveyConfig.clearPriorSurveyResponses();
        }
    }
    catch (e) {
        // Ignore any background errors posting the survey; if posting fails,
        // then we'll try again the next time a user runs a CLI command.
    }
}
exports.postSurveyResponse = postSurveyResponse;
if (process.argv[1] === __filename) {
    void postSurveyResponse();
}
//# sourceMappingURL=post_survey.js.map