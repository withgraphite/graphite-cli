import * as t from '@withgraphite/retype';
declare const surveyConfigSchema: (value: unknown, opts?: {
    logFailures: boolean;
} | undefined) => value is {
    responses?: ({} & {
        responses: ({} & {
            answer: string;
            question: string;
        })[];
        timestamp: number;
        exitedEarly: boolean;
    }) | undefined;
} & {
    postingResponse: boolean;
};
export declare type TSurveyResponse = NonNullable<t.TypeOf<typeof surveyConfigSchema>['responses']>;
export declare const surveyConfigFactory: {
    load: (filePath?: string | undefined) => {
        readonly data: {
            responses?: ({} & {
                responses: ({} & {
                    answer: string;
                    question: string;
                })[];
                timestamp: number;
                exitedEarly: boolean;
            }) | undefined;
        } & {
            postingResponse: boolean;
        };
        readonly update: (mutator: (data: {
            responses?: ({} & {
                responses: ({} & {
                    answer: string;
                    question: string;
                })[];
                timestamp: number;
                exitedEarly: boolean;
            }) | undefined;
        } & {
            postingResponse: boolean;
        }) => void) => void;
        readonly path: string;
        delete: () => void;
    } & {
        setSurveyResponses: (responses: TSurveyResponse) => void;
        hasSurveyResponse: () => boolean;
        clearPriorSurveyResponses: () => void;
    };
    loadIfExists: (filePath?: string | undefined) => ({
        readonly data: {
            responses?: ({} & {
                responses: ({} & {
                    answer: string;
                    question: string;
                })[];
                timestamp: number;
                exitedEarly: boolean;
            }) | undefined;
        } & {
            postingResponse: boolean;
        };
        readonly update: (mutator: (data: {
            responses?: ({} & {
                responses: ({} & {
                    answer: string;
                    question: string;
                })[];
                timestamp: number;
                exitedEarly: boolean;
            }) | undefined;
        } & {
            postingResponse: boolean;
        }) => void) => void;
        readonly path: string;
        delete: () => void;
    } & {
        setSurveyResponses: (responses: TSurveyResponse) => void;
        hasSurveyResponse: () => boolean;
        clearPriorSurveyResponses: () => void;
    }) | undefined;
};
export declare type TSurveyConfig = ReturnType<typeof surveyConfigFactory.load>;
export {};
