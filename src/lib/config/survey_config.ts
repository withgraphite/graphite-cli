import graphiteCLIRoutes from '@withgraphite/graphite-cli-routes';
import * as t from '@withgraphite/retype';
import { request } from '@withgraphite/retyped-routes';
import { API_SERVER } from '../api';
import { TContext } from '../context/context';
import { cliAuthPrecondition } from '../preconditions';
import { composeConfig } from './compose_config';

const surveyConfigSchema = t.shape({
  responses: t.optional(
    t.shape({
      timestamp: t.number,
      responses: t.array(t.shape({ question: t.string, answer: t.string })),
      exitedEarly: t.boolean,
    })
  ),
  postingResponse: t.boolean,
});

export type TSurveyResponse = NonNullable<
  t.TypeOf<typeof surveyConfigSchema>['responses']
>;

export const surveyConfigFactory = composeConfig({
  schema: surveyConfigSchema,
  defaultLocations: [
    {
      relativePath: '.graphite_beta_survey',
      relativeTo: 'USER_HOME',
    },
  ],
  initialize: () => {
    return {
      responses: undefined,
      postingResponse: false,
    };
  },
  helperFunctions: (data, update) => {
    return {
      setSurveyResponses: (responses: TSurveyResponse): void => {
        update((data) => (data.responses = responses));
      },
      hasSurveyResponse: (): boolean => data.responses !== undefined,
      clearPriorSurveyResponses: (): void => {
        update((data) => (data.responses = undefined));
      },
      postResponses: async (context: TContext): Promise<boolean> => {
        try {
          const surveyResponse = data.responses;
          if (surveyResponse === undefined) {
            return false;
          }

          const authToken = cliAuthPrecondition(context);

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
            return true;
          }
        } catch (e) {
          // Ignore any background errors posting the survey; if posting fails,
          // then we'll try again the next time a user runs a CLI command.
        }

        return false;
      },
    };
  },
});
