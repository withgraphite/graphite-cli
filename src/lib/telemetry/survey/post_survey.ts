import cp from 'child_process';
import { TContext } from '../../context/context';

export function postSurveyResponsesInBackground(context: TContext): void {
  // We don't worry about race conditions here - we can dedup on the server.
  if (context.surveyConfig.hasSurveyResponse()) {
    cp.spawn('/usr/bin/env', ['node', __filename], {
      detached: true,
      stdio: 'ignore',
    });
  }
}

export async function postSurveyResponse(context: TContext): Promise<void> {
  const responsePostedSuccessfully = await context.surveyConfig.postResponses(
    context
  );
  if (responsePostedSuccessfully) {
    context.surveyConfig.clearPriorSurveyResponses();
  }
}
