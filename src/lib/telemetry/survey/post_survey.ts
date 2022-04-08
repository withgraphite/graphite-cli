import { initContext, TContext } from '../../context/context';
import { spawnDetached } from '../../utils/spawn';

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
