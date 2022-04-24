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
Object.defineProperty(exports, "__esModule", { value: true });
exports.postSurveyResponse = exports.postSurveyResponsesInBackground = void 0;
const context_1 = require("../../context/context");
const spawn_1 = require("../../utils/spawn");
function postSurveyResponsesInBackground(context) {
    // We don't worry about race conditions here - we can dedup on the server.
    if (context.surveyConfig.hasSurveyResponse()) {
        spawn_1.spawnDetached(__filename);
    }
}
exports.postSurveyResponsesInBackground = postSurveyResponsesInBackground;
function postSurveyResponse(context) {
    return __awaiter(this, void 0, void 0, function* () {
        const responsePostedSuccessfully = yield context.surveyConfig.postResponses(context);
        if (responsePostedSuccessfully) {
            context.surveyConfig.clearPriorSurveyResponses();
        }
    });
}
exports.postSurveyResponse = postSurveyResponse;
if (process.argv[1] === __filename) {
    void postSurveyResponse(context_1.initContext());
}
//# sourceMappingURL=post_survey.js.map