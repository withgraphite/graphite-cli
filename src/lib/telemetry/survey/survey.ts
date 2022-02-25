import graphiteCLIRoutes from '@withgraphite/graphite-cli-routes';
import { default as t } from '@withgraphite/retype';
import { request } from '@withgraphite/retyped-routes';
import prompts from 'prompts';
import { API_SERVER } from '../../../lib/api';
import { cliAuthPrecondition } from '../../../lib/preconditions';
import { TContext } from '../../context/context';
import { logMessageFromGraphite, logNewline } from '../../utils';
import { TSurveyResponse } from './../../config/survey_config';
import { postSurveyResponse } from './post_survey';

export type SurveyT = t.UnwrapSchemaMap<
  typeof graphiteCLIRoutes.cliSurvey.response
>['survey'];

export async function getSurvey(
  context: TContext
): Promise<SurveyT | undefined> {
  try {
    const authToken = cliAuthPrecondition(context);
    const response = await request.requestWithArgs(
      API_SERVER,
      graphiteCLIRoutes.cliSurvey,
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

    logNewline();
    if (survey?.introMessage !== undefined) {
      logMessageFromGraphite(survey.introMessage);
    }

    logNewline();
    await askSurveyQuestions({
      questions: survey.questions,
      responses: responses,
    });

    logNewline();
    await logAnswers(
      {
        responses: responses,
        completionMessage: survey?.completionMessage,
      },
      context
    );
  } catch (err: any) {
    switch (err.constructor) {
      case ExitedSurveyError:
        responses.exitedEarly = true;
        logNewline();
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
async function askSurveyQuestions(args: {
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
}): Promise<void> {
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
    logNewline();

    args.responses.responses.push({
      question: question.question,
      answer: promptResponse.answer,
    });
  }
}

// eslint-disable-next-line @typescript-eslint/no-empty-function
function assertUnreachable(arg: never): void {}

async function logAnswers(
  args: {
    responses: TSurveyResponse;
    completionMessage: string | undefined;
  },
  context: TContext
): Promise<void> {
  context.surveyConfig.setSurveyResponses(args.responses);

  await postSurveyResponse(context);

  if (args.completionMessage !== undefined) {
    logMessageFromGraphite(args.completionMessage);
  }
  return;
}
