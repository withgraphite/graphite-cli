import { SurveyResponseT } from "../telemetry/survey/survey";
declare type TSurveyConfig = {
    responses: SurveyResponseT | undefined;
    postingResponse: boolean;
};
declare class SurveyConfig {
    _data: TSurveyConfig;
    constructor(data: TSurveyConfig);
    setSurveyResponses(responses: SurveyResponseT): void;
    hasSurveyResponse(): boolean;
    clearPriorSurveyResponse(): void;
    postResponses(): Promise<boolean>;
    path(): string;
    private save;
    static delete(): void;
}
declare const surveyConfigSingleton: SurveyConfig;
export default surveyConfigSingleton;
