import * as t from '@withgraphite/retype';
import { TContext } from '../context/context';
declare const surveyConfigSchema: (value: unknown, opts?: {
    logFailures: boolean;
} | undefined) => value is {
    responses: {
        timestamp: number;
        responses: {
            question: string;
            answer: string;
        }[];
        exitedEarly: boolean;
    } | undefined;
    postingResponse: boolean;
};
export declare type TSurveyResponse = NonNullable<t.TypeOf<typeof surveyConfigSchema>['responses']>;
export declare const surveyConfigFactory: {
    load: (configPath?: string | undefined) => {
        readonly data: {
            responses: {
                timestamp: number;
                responses: {
                    question: string;
                    answer: string;
                }[];
                exitedEarly: boolean;
            } | undefined;
            postingResponse: boolean;
        };
        readonly update: (mutator: (data: {
            responses: {
                timestamp: number;
                responses: {
                    question: string;
                    answer: string;
                }[];
                exitedEarly: boolean;
            } | undefined;
            postingResponse: boolean;
        }) => void) => void;
        readonly path: string;
        delete: () => void;
    } & {
        setSurveyResponses: (responses: TSurveyResponse) => void;
        hasSurveyResponse: () => boolean;
        clearPriorSurveyResponses: () => void;
        postResponses: (context: TContext) => Promise<boolean>;
    };
    loadIfExists: (configPath?: string | undefined) => ({
        readonly data: {
            responses: {
                timestamp: number;
                responses: {
                    question: string;
                    answer: string;
                }[];
                exitedEarly: boolean;
            } | undefined;
            postingResponse: boolean;
        };
        readonly update: (mutator: (data: {
            responses: {
                timestamp: number;
                responses: {
                    question: string;
                    answer: string;
                }[];
                exitedEarly: boolean;
            } | undefined;
            postingResponse: boolean;
        }) => void) => void;
        readonly path: string;
        delete: () => void;
    } & {
        setSurveyResponses: (responses: TSurveyResponse) => void;
        hasSurveyResponse: () => boolean;
        clearPriorSurveyResponses: () => void;
        postResponses: (context: TContext) => Promise<boolean>;
    }) | undefined;
};
export {};
