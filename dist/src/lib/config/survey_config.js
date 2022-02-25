"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
exports.surveyConfig = exports.surveyConfigFactory = void 0;
const graphite_cli_routes_1 = __importDefault(require("@withgraphite/graphite-cli-routes"));
const t = __importStar(require("@withgraphite/retype"));
const retyped_routes_1 = require("@withgraphite/retyped-routes");
const api_1 = require("../api");
const preconditions_1 = require("../preconditions");
const compose_config_1 = require("./compose_config");
const surveyConfigSchema = t.shape({
    responses: t.optional(t.shape({
        timestamp: t.number,
        responses: t.array(t.shape({ question: t.string, answer: t.string })),
        exitedEarly: t.boolean,
    })),
    postingResponse: t.boolean,
});
exports.surveyConfigFactory = compose_config_1.composeConfig({
    schema: surveyConfigSchema,
    defaultLocations: [
        {
            relativePath: '.graphite_beta_survey',
            relativeTo: 'USER_HOME',
        },
    ],
    initialize: () => {
        return {
            responses: undefined,
            postingResponse: false,
        };
    },
    helperFunctions: (data, update) => {
        return {
            setSurveyResponses: (responses) => {
                update((data) => (data.responses = responses));
            },
            hasSurveyResponse: () => data.responses !== undefined,
            clearPriorSurveyResponses: () => {
                update((data) => (data.responses = undefined));
            },
            postResponses: () => __awaiter(void 0, void 0, void 0, function* () {
                try {
                    const surveyResponse = data.responses;
                    if (surveyResponse === undefined) {
                        return false;
                    }
                    const authToken = preconditions_1.cliAuthPrecondition();
                    const response = yield retyped_routes_1.request.requestWithArgs(api_1.API_SERVER, graphite_cli_routes_1.default.surveyResponse, {
                        authToken: authToken,
                        responses: {
                            timestamp: surveyResponse.timestamp,
                            responses: surveyResponse.responses.map((qa) => {
                                return {
                                    question: qa.question,
                                    response: qa.answer,
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
            }),
        };
    },
});
exports.surveyConfig = exports.surveyConfigFactory.load();
//# sourceMappingURL=survey_config.js.map