import graphiteCLIRoutes from "@screenplaydev/graphite-cli-routes";
import { default as t } from "@screenplaydev/retype";
export declare type SurveyT = t.UnwrapSchemaMap<typeof graphiteCLIRoutes.cliSurvey.response>["survey"];
export declare function getSurvey(): Promise<SurveyT | undefined>;
export declare type SurveyResponseT = {
    timestamp: number;
    responses: {
        [question: string]: string;
    };
    exitedEarly: boolean;
};
export declare function showSurvey(survey: SurveyT): Promise<void>;
