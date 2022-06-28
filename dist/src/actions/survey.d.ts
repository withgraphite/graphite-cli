import { API_ROUTES } from '@withgraphite/graphite-cli-routes';
import { default as t } from '@withgraphite/retype';
import { TContext } from '../lib/context';
declare type SurveyT = t.UnwrapSchemaMap<typeof API_ROUTES.cliSurvey.response>['survey'];
export declare function getSurvey(context: TContext): Promise<SurveyT | undefined>;
export declare function showSurvey(survey: SurveyT, context: TContext): Promise<void>;
export {};
