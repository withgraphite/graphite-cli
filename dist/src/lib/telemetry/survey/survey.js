"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.showSurvey = exports.getSurvey = void 0;
const graphite_cli_routes_1 = __importDefault(require("@screenplaydev/graphite-cli-routes"));
const retyped_routes_1 = require("@screenplaydev/retyped-routes");
const prompts_1 = __importDefault(require("prompts"));
const api_1 = require("../../../lib/api");
const survey_config_1 = __importDefault(require("../../../lib/config/survey_config"));
const preconditions_1 = require("../../../lib/preconditions");
const utils_1 = require("../../utils");
const post_survey_1 = require("./post_survey");
function getSurvey() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const authToken = preconditions_1.cliAuthPrecondition();
            const response = yield retyped_routes_1.request.requestWithArgs(api_1.API_SERVER, graphite_cli_routes_1.default.cliSurvey, {}, { authToken: authToken });
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
    });
}
exports.getSurvey = getSurvey;
class ExitedSurveyError extends Error {
    constructor() {
        super(`User exited Graphite survey early`);
        this.name = "Killed";
    }
}
function showSurvey(survey) {
    return __awaiter(this, void 0, void 0, function* () {
        const responses = {
            timestamp: Date.now(),
            responses: {},
            exitedEarly: false,
        };
        try {
            if (survey === undefined) {
                return;
            }
            utils_1.logNewline();
            if ((survey === null || survey === void 0 ? void 0 : survey.introMessage) !== undefined) {
                utils_1.logMessageFromGraphite(survey.introMessage);
            }
            utils_1.logNewline();
            yield askSurveyQuestions({
                questions: survey.questions,
                responses: responses,
            });
            utils_1.logNewline();
            yield logAnswers({
                responses: responses,
                completionMessage: survey === null || survey === void 0 ? void 0 : survey.completionMessage,
            });
        }
        catch (err) {
            switch (err.constructor) {
                case ExitedSurveyError:
                    responses.exitedEarly = true;
                    utils_1.logNewline();
                    yield logAnswers({
                        responses: responses,
                        completionMessage: survey === null || survey === void 0 ? void 0 : survey.completionMessage,
                    });
                    break;
                default:
                    throw err;
            }
        }
    });
}
exports.showSurvey = showSurvey;
/**
 * While capturing the responses, mutate the passed-in object so we can always
 * capture and potential responses before the user decided to exit the survey
 * early.
 */
function askSurveyQuestions(args) {
    return __awaiter(this, void 0, void 0, function* () {
        for (const [index, question] of args.questions.entries()) {
            const onCancel = {
                onCancel: () => {
                    throw new ExitedSurveyError();
                },
            };
            let promptResponse;
            const questionText = `Question [${index + 1}/${args.questions.length}]: ${question.question}`;
            switch (question.type) {
                case "TEXT":
                    promptResponse = yield prompts_1.default({
                        type: "text",
                        name: "answer",
                        message: questionText,
                    }, onCancel);
                    break;
                case "OPTIONS":
                    promptResponse = yield prompts_1.default({
                        type: "select",
                        name: "answer",
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
                    assertUnreachable(question);
                    continue;
            }
            // Add newline after each response to create visual separation to next
            // question.
            utils_1.logNewline();
            args.responses.responses[question.question] = promptResponse.answer;
        }
    });
}
// eslint-disable-next-line @typescript-eslint/no-empty-function
function assertUnreachable(arg) { }
function logAnswers(args) {
    return __awaiter(this, void 0, void 0, function* () {
        survey_config_1.default.setSurveyResponses(args.responses);
        yield post_survey_1.postSurveyResponse();
        if (args.completionMessage !== undefined) {
            utils_1.logMessageFromGraphite(args.completionMessage);
        }
        return;
    });
}
//# sourceMappingURL=survey.js.map