import { API_ROUTES } from '@withgraphite/graphite-cli-routes';
import { default as t } from '@withgraphite/retype';
import { request } from '@withgraphite/retyped-routes';
import prompts from 'prompts';
import { postSurveyResponse } from '../background_tasks/post_survey';
import { API_SERVER } from '../lib/api/server';
import { TSurveyResponse } from '../lib/config/survey_config';
import { TContext } from '../lib/context';
import { cliAuthPrecondition } from '../lib/preconditions';
import { assertUnreachable } from '../lib/utils/assert_unreachable';

type SurveyT = t.UnwrapSchemaMap<
  typeof API_ROUTES.cliSurvey.response
>['survey'];

export async function getSurvey(
  context: TContext
): Promise<SurveyT | undefined> {
  try {
    const authToken = cliAuthPrecondition(context);
    const response = await request.requestWithArgs(
      API_SERVER,
      API_ROUTES.cliSurvey,
      {},
      { authToken: authToken }
    );
    if (response._response.status === 200) {
      return response.survey;
    }
  } catch (e) {
    // silence any error - this shouldn't crash any part of the CLI
  }

  // If we didn't get a definitive answer, let's be conservative and err on
  // the side of *not* showing the survey in potentially incorrect situations.
  return undefined;
}

class ExitedSurveyError extends Error {
  constructor() {
    super(`User exited Graphite survey early`);
    this.name = 'Killed';
  }
}

export async function showSurvey(
  survey: SurveyT,
  context: TContext
): Promise<void> {
  const responses: TSurveyResponse = {
    timestamp: Date.now(),
    responses: [],
    exitedEarly: false,
  };
  try {
    if (survey === undefined) {
      return;
    }

    context.splog.newline();
    if (survey?.introMessage !== undefined) {
      context.splog.message(survey.introMessage);
    }

    context.splog.newline();
    await askSurveyQuestions(
      {
        questions: survey.questions,
        responses: responses,
      },
      context
    );

    context.splog.newline();
    await logAnswers(
      {
        responses: responses,
        completionMessage: survey?.completionMessage,
      },
      context
    );
  } catch (err) {
    switch (err.constructor) {
      case ExitedSurveyError:
        responses.exitedEarly = true;
        context.splog.newline();
        await logAnswers(
          {
            responses: responses,
            completionMessage: survey?.completionMessage,
          },
          context
        );
        break;
      default:
        throw err;
    }
  }
}

/**
 * While capturing the responses, mutate the passed-in object so we can always
 * capture and potential responses before the user decided to exit the survey
 * early.
 */
async function askSurveyQuestions(
  args: {
    questions: (
      | {
          type: 'TEXT';
          question: string;
        }
      | {
          type: 'OPTIONS';
          question: string;
          options: string[];
        }
    )[];
    responses: TSurveyResponse;
  },
  context: TContext
): Promise<void> {
  for (const [index, question] of args.questions.entries()) {
    const onCancel = {
      onCancel: () => {
        throw new ExitedSurveyError();
      },
    };

    let promptResponse;
    const questionText = `Question [${index + 1}/${args.questions.length}]: ${
      question.question
    }`;

    switch (question.type) {
      case 'TEXT':
        promptResponse = await prompts(
          {
            type: 'text',
            name: 'answer',
            message: questionText,
          },
          onCancel
        );
        break;
      case 'OPTIONS':
        promptResponse = await prompts(
          {
            type: 'select',
            name: 'answer',
            message: questionText,
            choices: question.options.map((option) => {
              return {
                title: option,
                value: option,
              };
            }),
          },
          onCancel
        );
        break;
      default:
        assertUnreachable(question);
        continue;
    }

    // Add newline after each response to create visual separation to next
    // question.
    context.splog.newline();

    args.responses.responses.push({
      question: question.question,
      answer: promptResponse.answer,
    });
  }
}

async function logAnswers(
  args: {
    responses: TSurveyResponse;
    completionMessage: string | undefined;
  },
  context: TContext
): Promise<void> {
  context.surveyConfig.setSurveyResponses(args.responses);

  await postSurveyResponse();

  if (args.completionMessage !== undefined) {
    context.splog.message(args.completionMessage);
  }
  return;
}
