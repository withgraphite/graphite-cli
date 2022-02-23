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
const graphite_cli_routes_1 = __importDefault(require("@withgraphite/graphite-cli-routes"));
const retyped_routes_1 = require("@withgraphite/retyped-routes");
const fs_extra_1 = __importDefault(require("fs-extra"));
const os_1 = __importDefault(require("os"));
const path_1 = __importDefault(require("path"));
const api_1 = require("../api");
const preconditions_1 = require("../preconditions");
const SURVEY_CONFIG_NAME = '.graphite_beta_survey';
const SURVEY_CONFIG_PATH = path_1.default.join(os_1.default.homedir(), SURVEY_CONFIG_NAME);
class SurveyConfig {
    constructor(data) {
        this._data = data;
    }
    setSurveyResponses(responses) {
        this._data.responses = responses;
        this.save();
    }
    hasSurveyResponse() {
        return this._data.responses !== undefined;
    }
    clearPriorSurveyResponse() {
        this._data.responses = undefined;
        this.save();
    }
    postResponses() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const surveyResponse = this._data.responses;
                if (surveyResponse === undefined) {
                    return false;
                }
                const authToken = preconditions_1.cliAuthPrecondition();
                const response = yield retyped_routes_1.request.requestWithArgs(api_1.API_SERVER, graphite_cli_routes_1.default.surveyResponse, {
                    authToken: authToken,
                    responses: {
                        timestamp: surveyResponse.timestamp,
                        responses: Object.keys(surveyResponse.responses).map((question) => {
                            return {
                                question: question,
                                response: surveyResponse.responses[question],
                            };
                        }),
                        exitedEarly: surveyResponse.exitedEarly,
                    },
                });
                if (response._response.status === 200) {
                    return true;
                }
            }
            catch (e) {
                // Ignore any background errors posting the survey; if posting fails,
                // then we'll try again the next time a user runs a CLI command.
            }
            return false;
        });
    }
    path() {
        return SURVEY_CONFIG_PATH;
    }
    save() {
        if (this._data.responses !== undefined) {
            fs_extra_1.default.writeFileSync(SURVEY_CONFIG_PATH, JSON.stringify(this._data));
            return;
        }
        // If we've reached this point, the survey config fields are empty - so we
        // clean up the now unnecessary file.
        SurveyConfig.delete();
    }
    static delete() {
        if (fs_extra_1.default.existsSync(SURVEY_CONFIG_PATH)) {
            fs_extra_1.default.unlinkSync(SURVEY_CONFIG_PATH);
            return;
        }
    }
}
function readSurveyConfig() {
    if (fs_extra_1.default.existsSync(SURVEY_CONFIG_PATH)) {
        const raw = fs_extra_1.default.readFileSync(SURVEY_CONFIG_PATH);
        try {
            const parsedConfig = JSON.parse(raw.toString().trim());
            return new SurveyConfig(parsedConfig);
        }
        catch (e) {
            // There was some error so just silently clean up the file - hopefully
            // we'll fix the malformed survey config on the next creation/save.
            SurveyConfig.delete();
        }
    }
    return new SurveyConfig({
        responses: undefined,
        postingResponse: false,
    });
}
const surveyConfigSingleton = readSurveyConfig();
exports.default = surveyConfigSingleton;
//# sourceMappingURL=survey_config.js.map