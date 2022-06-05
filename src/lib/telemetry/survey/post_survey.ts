import graphiteCLIRoutes from '@withgraphite/graphite-cli-routes';
import { request } from '@withgraphite/retyped-routes';
import { API_SERVER } from '../../api/server';
import { surveyConfigFactory } from '../../config/survey_config';
import { userConfigFactory } from '../../config/user_config';
import { TContext } from '../../context';
import { spawnDetached } from '../../utils/spawn';

// We try to post the survey response right after the user takes it, but in
// case they quit early or there's some error, we'll continue to try to post
// it in the future until it succeeds.
export function postSurveyResponsesInBackground(context: TContext): void {
  // We don't worry about race conditions here - we can dedup on the server.
  if (context.surveyConfig.hasSurveyResponse()) {
    spawnDetached(__filename);
  }
}

export async function postSurveyResponse(): Promise<void> {
  try {
    const surveyConfig = surveyConfigFactory.loadIfExists();
    const surveyResponse = surveyConfig?.data.responses;
    const authToken = userConfigFactory.loadIfExists()?.data.authToken;

    if (!surveyConfig || !surveyResponse || !authToken) {
      return;
    }

    const response = await request.requestWithArgs(
      API_SERVER,
      graphiteCLIRoutes.surveyResponse,
      {
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
      }
    );

    if (response._response.status === 200) {
      surveyConfig.clearPriorSurveyResponses();
    }
  } catch (e) {
    // Ignore any background errors posting the survey; if posting fails,
    // then we'll try again the next time a user runs a CLI command.
  }
}

if (process.argv[1] === __filename) {
  void postSurveyResponse();
}
