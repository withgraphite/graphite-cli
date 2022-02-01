"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.showSurvey = exports.getSurvey = void 0;
var retyped_routes_1 = require("@screenplaydev/retyped-routes");
var graphite_cli_routes_1 = require("graphite-cli-routes");
var prompts_1 = require("prompts");
var api_1 = require("../../../lib/api");
var survey_config_1 = require("../../../lib/config/survey_config");
var preconditions_1 = require("../../../lib/preconditions");
var utils_1 = require("../../utils");
var post_survey_1 = require("./post_survey");
function getSurvey() {
    return __awaiter(this, void 0, void 0, function () {
        var authToken, response, e_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    authToken = preconditions_1.cliAuthPrecondition();
                    return [4 /*yield*/, retyped_routes_1.request.requestWithArgs(api_1.API_SERVER, graphite_cli_routes_1["default"].cliSurvey, {}, { authToken: authToken })];
                case 1:
                    response = _a.sent();
                    if (response._response.status === 200) {
                        return [2 /*return*/, response.survey];
                    }
                    return [3 /*break*/, 3];
                case 2:
                    e_1 = _a.sent();
                    return [3 /*break*/, 3];
                case 3: 
                // If we didn't get a definitive answer, let's be conservative and err on
                // the side of *not* showing the survey in potentially incorrect situations.
                return [2 /*return*/, undefined];
            }
        });
    });
}
exports.getSurvey = getSurvey;
var ExitedSurveyError = /** @class */ (function (_super) {
    __extends(ExitedSurveyError, _super);
    function ExitedSurveyError() {
        var _this = _super.call(this, "User exited Graphite survey early") || this;
        _this.name = 'Killed';
        return _this;
    }
    return ExitedSurveyError;
}(Error));
function showSurvey(survey) {
    return __awaiter(this, void 0, void 0, function () {
        var responses, err_1, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    responses = {
                        timestamp: Date.now(),
                        responses: {},
                        exitedEarly: false
                    };
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 4, , 9]);
                    if (survey === undefined) {
                        return [2 /*return*/];
                    }
                    utils_1.logNewline();
                    if ((survey === null || survey === void 0 ? void 0 : survey.introMessage) !== undefined) {
                        utils_1.logMessageFromGraphite(survey.introMessage);
                    }
                    utils_1.logNewline();
                    return [4 /*yield*/, askSurveyQuestions({
                            questions: survey.questions,
                            responses: responses
                        })];
                case 2:
                    _b.sent();
                    utils_1.logNewline();
                    return [4 /*yield*/, logAnswers({
                            responses: responses,
                            completionMessage: survey === null || survey === void 0 ? void 0 : survey.completionMessage
                        })];
                case 3:
                    _b.sent();
                    return [3 /*break*/, 9];
                case 4:
                    err_1 = _b.sent();
                    _a = err_1.constructor;
                    switch (_a) {
                        case ExitedSurveyError: return [3 /*break*/, 5];
                    }
                    return [3 /*break*/, 7];
                case 5:
                    responses.exitedEarly = true;
                    utils_1.logNewline();
                    return [4 /*yield*/, logAnswers({
                            responses: responses,
                            completionMessage: survey === null || survey === void 0 ? void 0 : survey.completionMessage
                        })];
                case 6:
                    _b.sent();
                    return [3 /*break*/, 8];
                case 7: throw err_1;
                case 8: return [3 /*break*/, 9];
                case 9: return [2 /*return*/];
            }
        });
    });
}
exports.showSurvey = showSurvey;
/**
 * While capturing the responses, mutate the passed-in object so we can always
 * capture and potential responses before the user decided to exit the survey
 * early.
 */
function askSurveyQuestions(args) {
    return __awaiter(this, void 0, void 0, function () {
        var _i, _a, _b, index, question, onCancel, promptResponse, questionText, _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    _i = 0, _a = args.questions.entries();
                    _d.label = 1;
                case 1:
                    if (!(_i < _a.length)) return [3 /*break*/, 9];
                    _b = _a[_i], index = _b[0], question = _b[1];
                    onCancel = {
                        onCancel: function () {
                            throw new ExitedSurveyError();
                        }
                    };
                    promptResponse = void 0;
                    questionText = "Question [" + (index + 1) + "/" + args.questions.length + "]: " + question.question;
                    _c = question.type;
                    switch (_c) {
                        case 'TEXT': return [3 /*break*/, 2];
                        case 'OPTIONS': return [3 /*break*/, 4];
                    }
                    return [3 /*break*/, 6];
                case 2: return [4 /*yield*/, prompts_1["default"]({
                        type: 'text',
                        name: 'answer',
                        message: questionText
                    }, onCancel)];
                case 3:
                    promptResponse = _d.sent();
                    return [3 /*break*/, 7];
                case 4: return [4 /*yield*/, prompts_1["default"]({
                        type: 'select',
                        name: 'answer',
                        message: questionText,
                        choices: question.options.map(function (option) {
                            return {
                                title: option,
                                value: option
                            };
                        })
                    }, onCancel)];
                case 5:
                    promptResponse = _d.sent();
                    return [3 /*break*/, 7];
                case 6:
                    assertUnreachable(question);
                    return [3 /*break*/, 8];
                case 7:
                    // Add newline after each response to create visual separation to next
                    // question.
                    utils_1.logNewline();
                    args.responses.responses[question.question] = promptResponse.answer;
                    _d.label = 8;
                case 8:
                    _i++;
                    return [3 /*break*/, 1];
                case 9: return [2 /*return*/];
            }
        });
    });
}
// eslint-disable-next-line @typescript-eslint/no-empty-function
function assertUnreachable(arg) { }
function logAnswers(args) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    survey_config_1["default"].setSurveyResponses(args.responses);
                    return [4 /*yield*/, post_survey_1.postSurveyResponse()];
                case 1:
                    _a.sent();
                    if (args.completionMessage !== undefined) {
                        utils_1.logMessageFromGraphite(args.completionMessage);
                    }
                    return [2 /*return*/];
            }
        });
    });
}
