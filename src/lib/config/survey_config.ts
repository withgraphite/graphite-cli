import * as t from '@withgraphite/retype';
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
    };
  },
});

export type TSurveyConfig = ReturnType<typeof surveyConfigFactory.load>;
