"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.showSurvey = exports.getSurvey = void 0;
const graphite_cli_routes_1 = require("@withgraphite/graphite-cli-routes");
const retyped_routes_1 = require("@withgraphite/retyped-routes");
const prompts_1 = __importDefault(require("prompts"));
const post_survey_1 = require("../background_tasks/post_survey");
const server_1 = require("../lib/api/server");
const preconditions_1 = require("../lib/preconditions");
const assert_unreachable_1 = require("../lib/utils/assert_unreachable");
async function getSurvey(context) {
    try {
        const authToken = (0, preconditions_1.cliAuthPrecondition)(context);
        const response = await retyped_routes_1.request.requestWithArgs(server_1.API_SERVER, graphite_cli_routes_1.API_ROUTES.cliSurvey, {}, { authToken: authToken });
        if (response._response.status === 200) {
            return response.survey;
        }
    }
    catch (e) {
        // silence any error - this shouldn't crash any part of the CLI
    }
    // If we didn't get a definitive answer, let's be conservative and err on
    // the side of *not* showing the survey in potentially incorrect situations.
    return undefined;
}
exports.getSurvey = getSurvey;
class ExitedSurveyError extends Error {
    constructor() {
        super(`User exited Graphite survey early`);
        this.name = 'Killed';
    }
}
async function showSurvey(survey, context) {
    const responses = {
        timestamp: Date.now(),
        responses: [],
        exitedEarly: false,
    };
    try {
        if (survey === undefined) {
            return;
        }
        context.splog.newline();
        if (survey?.introMessage !== undefined) {
            context.splog.message(survey.introMessage);
        }
        context.splog.newline();
        await askSurveyQuestions({
            questions: survey.questions,
            responses: responses,
        }, context);
        context.splog.newline();
        await logAnswers({
            responses: responses,
            completionMessage: survey?.completionMessage,
        }, context);
    }
    catch (err) {
        switch (err.constructor) {
            case ExitedSurveyError:
                responses.exitedEarly = true;
                context.splog.newline();
                await logAnswers({
                    responses: responses,
                    completionMessage: survey?.completionMessage,
                }, context);
                break;
            default:
                throw err;
        }
    }
}
exports.showSurvey = showSurvey;
/**
 * While capturing the responses, mutate the passed-in object so we can always
 * capture and potential responses before the user decided to exit the survey
 * early.
 */
async function askSurveyQuestions(args, context) {
    for (const [index, question] of args.questions.entries()) {
        const onCancel = {
            onCancel: () => {
                throw new ExitedSurveyError();
            },
        };
        let promptResponse;
        const questionText = `Question [${index + 1}/${args.questions.length}]: ${question.question}`;
        switch (question.type) {
            case 'TEXT':
                promptResponse = await (0, prompts_1.default)({
                    type: 'text',
                    name: 'answer',
                    message: questionText,
                }, onCancel);
                break;
            case 'OPTIONS':
                promptResponse = await (0, prompts_1.default)({
                    type: 'select',
                    name: 'answer',
                    message: questionText,
                    choices: question.options.map((option) => {
                        return {
                            title: option,
                            value: option,
                        };
                    }),
                }, onCancel);
                break;
            default:
                (0, assert_unreachable_1.assertUnreachable)(question);
                continue;
        }
        // Add newline after each response to create visual separation to next
        // question.
        context.splog.newline();
        args.responses.responses.push({
            question: question.question,
            answer: promptResponse.answer,
        });
    }
}
async function logAnswers(args, context) {
    context.surveyConfig.setSurveyResponses(args.responses);
    await (0, post_survey_1.postSurveyResponse)();
    if (args.completionMessage !== undefined) {
        context.splog.message(args.completionMessage);
    }
    return;
}
//# sourceMappingURL=survey.js.map