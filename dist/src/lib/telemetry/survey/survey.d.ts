import { default as t } from '@screenplaydev/retype';
import graphiteCLIRoutes from 'graphite-cli-routes';
export declare type SurveyT = t.UnwrapSchemaMap<typeof graphiteCLIRoutes.cliSurvey.response>['survey'];
export declare function getSurvey(): Promise<SurveyT | undefined>;
export declare type SurveyResponseT = {
    timestamp: number;
    responses: {
        [question: string]: string;
    };
    exitedEarly: boolean;
};
export declare function showSurvey(survey: SurveyT): Promise<void>;
