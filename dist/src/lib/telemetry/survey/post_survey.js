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
exports.postSurveyResponse = exports.postSurveyResponsesInBackground = void 0;
const child_process_1 = __importDefault(require("child_process"));
const survey_config_1 = require("../../config/survey_config");
function postSurveyResponsesInBackground() {
    // We don't worry about race conditions here - we can dedup on the server.
    if (survey_config_1.surveyConfig.hasSurveyResponse()) {
        child_process_1.default.spawn('/usr/bin/env', ['node', __filename], {
            detached: true,
            stdio: 'ignore',
        });
    }
}
exports.postSurveyResponsesInBackground = postSurveyResponsesInBackground;
function postSurveyResponse() {
    return __awaiter(this, void 0, void 0, function* () {
        const responsePostedSuccessfully = yield survey_config_1.surveyConfig.postResponses();
        if (responsePostedSuccessfully) {
            survey_config_1.surveyConfig.clearPriorSurveyResponses();
        }
    });
}
exports.postSurveyResponse = postSurveyResponse;
if (process.argv[1] === __filename) {
    void postSurveyResponse();
}
//# sourceMappingURL=post_survey.js.map