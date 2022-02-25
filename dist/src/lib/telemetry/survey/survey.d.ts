import graphiteCLIRoutes from '@withgraphite/graphite-cli-routes';
import { default as t } from '@withgraphite/retype';
export declare type SurveyT = t.UnwrapSchemaMap<typeof graphiteCLIRoutes.cliSurvey.response>['survey'];
export declare function getSurvey(): Promise<SurveyT | undefined>;
export declare function showSurvey(survey: SurveyT): Promise<void>;
