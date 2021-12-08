import cp from 'child_process';
import surveyConfig from '../../config/survey_config';

export function postSurveyResponsesInBackground(): void {
  // We don't worry about race conditions here - we can dedup on the server.
  if (surveyConfig.hasSurveyResponse()) {
    cp.spawn('/usr/bin/env', ['node', __filename], {
      detached: true,
      stdio: 'ignore',
    });
  }
}

export async function postSurveyResponse(): Promise<void> {
  const responsePostedSuccessfully = await surveyConfig.postResponses();
  if (responsePostedSuccessfully) {
    surveyConfig.clearPriorSurveyResponse();
  }
}

if (process.argv[1] === __filename) {
  void postSurveyResponse();
}
