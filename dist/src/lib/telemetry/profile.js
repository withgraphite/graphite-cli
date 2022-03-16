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
exports.profile = void 0;
// Why does an open source CLI include telemetry?
// We the creators want to understand how people are using the tool
// All metrics logged are listed plain to see, and are non blocking in case the server is unavailable.
const chalk_1 = __importDefault(require("chalk"));
const _1 = require(".");
const package_json_1 = require("../../../package.json");
const init_1 = require("../../actions/init");
const exec_state_config_1 = require("../config/exec_state_config");
const context_1 = require("../context/context");
const errors_1 = require("../errors");
const requests_1 = require("../requests");
const utils_1 = require("../utils");
const merge_conflict_help_1 = require("../utils/merge_conflict_help");
const context_2 = require("./context");
const post_survey_1 = require("./survey/post_survey");
const tracer_1 = require("./tracer");
function initalizeContext() {
    const context = context_1.initContext();
    _1.fetchUpgradePromptInBackground(context);
    requests_1.refreshPRInfoInBackground(context);
    // We try to post the survey response right after the user takes it, but in
    // case they quit early or there's some error, we'll continue to try to post
    // it in the future until it succeeds.
    post_survey_1.postSurveyResponsesInBackground(context);
    return context;
}
function profile(args, canonicalName, handler) {
    return __awaiter(this, void 0, void 0, function* () {
        // Self heal repo config on all commands besides init:
        const parsedArgs = utils_1.parseArgs(args);
        const start = Date.now();
        _1.registerSigintHandler({
            commandName: parsedArgs.command,
            canonicalCommandName: canonicalName,
            startTime: start,
        });
        const context = initalizeContext();
        if (parsedArgs.command !== 'repo init' &&
            !context.repoConfig.graphiteInitialized()) {
            utils_1.logInfo(`Graphite has not been initialized, attempting to setup now...`);
            utils_1.logNewline();
            yield init_1.init(context);
        }
        try {
            yield tracer_1.globalTracer.span({
                name: 'command',
                resource: parsedArgs.command,
                meta: {
                    user: context_2.getUserEmail() || 'NotFound',
                    version: package_json_1.version,
                    args: parsedArgs.args,
                    alias: parsedArgs.alias,
                },
            }, () => __awaiter(this, void 0, void 0, function* () {
                try {
                    yield handler(context);
                }
                catch (err) {
                    switch (err.constructor) {
                        case errors_1.ExitFailedError:
                            utils_1.logError(err.message);
                            throw err;
                        case errors_1.PreconditionsFailedError:
                            utils_1.logInfo(err.message);
                            throw err;
                        case errors_1.RebaseConflictError:
                            utils_1.logNewline();
                            utils_1.logError(`Rebase conflict. ${err.message}`);
                            utils_1.logNewline();
                            merge_conflict_help_1.printGraphiteMergeConflictStatus();
                            utils_1.logNewline();
                            utils_1.logInfo([
                                `To fix and continue your previous Graphite command:`,
                                `(1) resolve the listed merge conflicts`,
                                `(2) mark them as resolved with "git add"`,
                                `(3) run "gt continue" to continue executing your previous Graphite command`,
                            ]
                                .map((line) => chalk_1.default.yellow(line))
                                .join('\n'));
                            return;
                        case errors_1.ValidationFailedError:
                            utils_1.logError(`Validation: ${err.message}`);
                            utils_1.logInfo(utils_1.VALIDATION_HELPER_MESSAGE);
                            throw err;
                        case errors_1.ConfigError:
                            utils_1.logError(`Bad Config: ${err.message}`);
                            throw err;
                        case errors_1.ExitCancelledError:
                            utils_1.logWarn(`Cancelled: ${err.message}`);
                            return;
                        case errors_1.SiblingBranchError:
                            utils_1.logError(err.message);
                            throw err;
                        case errors_1.MultiParentError:
                            utils_1.logError(err.message);
                            throw err;
                        case errors_1.KilledError:
                            return; // don't log output if user manually kills.
                        default:
                            utils_1.logError(err.message);
                            throw err;
                    }
                }
            }));
        }
        catch (err) {
            const end = Date.now();
            if (exec_state_config_1.execStateConfig.outputDebugLogs()) {
                utils_1.logInfo(err);
                utils_1.logInfo(err.stack);
            }
            _1.postTelemetryInBackground({
                canonicalCommandName: canonicalName,
                commandName: parsedArgs.command,
                durationMiliSeconds: end - start,
                err: {
                    errName: err.name,
                    errMessage: err.message,
                    errStack: err.stack || '',
                },
            });
            // eslint-disable-next-line no-restricted-syntax
            process.exit(1);
        }
        const end = Date.now();
        _1.postTelemetryInBackground({
            canonicalCommandName: canonicalName,
            commandName: parsedArgs.command,
            durationMiliSeconds: end - start,
        });
    });
}
exports.profile = profile;
//# sourceMappingURL=profile.js.map