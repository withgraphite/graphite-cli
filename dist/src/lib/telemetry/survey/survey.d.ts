import graphiteCLIRoutes from '@withgraphite/graphite-cli-routes';
import { default as t } from '@withgraphite/retype';
import { TContext } from '../../context';
export declare type SurveyT = t.UnwrapSchemaMap<typeof graphiteCLIRoutes.cliSurvey.response>['survey'];
export declare function getSurvey(context: TContext): Promise<SurveyT | undefined>;
export declare function showSurvey(survey: SurveyT, context: TContext): Promise<void>;
