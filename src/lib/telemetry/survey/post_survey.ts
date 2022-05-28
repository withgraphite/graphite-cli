import { initContext, TContext } from '../../context';
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

export async function postSurveyResponse(context: TContext): Promise<void> {
  const responsePostedSuccessfully = await context.surveyConfig.postResponses(
    context
  );
  if (responsePostedSuccessfully) {
    context.surveyConfig.clearPriorSurveyResponses();
  }
}

if (process.argv[1] === __filename) {
  void postSurveyResponse(initContext());
}
