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
const config_1 = require("../config");
const errors_1 = require("../errors");
const utils_1 = require("../utils");
const merge_conflict_help_1 = require("../utils/merge_conflict_help");
const context_1 = require("./context");
const tracer_1 = __importDefault(require("./tracer"));
function profile(args, canonicalName, handler) {
    return __awaiter(this, void 0, void 0, function* () {
        // Self heal repo config on all commands besides init:
        const parsedArgs = (0, utils_1.parseArgs)(args);
        const start = Date.now();
        (0, _1.registerSigintHandler)({
            commandName: parsedArgs.command,
            canonicalCommandName: canonicalName,
            startTime: start,
        });
        if (parsedArgs.command !== 'repo init' && !config_1.repoConfig.getTrunk()) {
            (0, utils_1.logInfo)(`Graphite has not been initialized, attempting to setup now...`);
            (0, utils_1.logNewline)();
            yield (0, init_1.init)();
        }
        try {
            yield tracer_1.default.span({
                name: 'command',
                resource: parsedArgs.command,
                meta: {
                    user: (0, context_1.getUserEmail)() || 'NotFound',
                    version: package_json_1.version,
                    args: parsedArgs.args,
                    alias: parsedArgs.alias,
                },
            }, () => __awaiter(this, void 0, void 0, function* () {
                try {
                    yield handler();
                }
                catch (err) {
                    switch (err.constructor) {
                        case errors_1.ExitFailedError:
                            (0, utils_1.logError)(err.message);
                            throw err;
                        case errors_1.PreconditionsFailedError:
                            (0, utils_1.logInfo)(err.message);
                            throw err;
                        case errors_1.RebaseConflictError:
                            (0, utils_1.logNewline)();
                            (0, utils_1.logError)(`Rebase conflict. ${err.message}`);
                            (0, utils_1.logNewline)();
                            (0, merge_conflict_help_1.printGraphiteMergeConflictStatus)();
                            (0, utils_1.logNewline)();
                            (0, utils_1.logInfo)([
                                `To fix and continue your previous Graphite command:`,
                                `(1) resolve the listed merge conflicts`,
                                `(2) mark them as resolved with "git add"`,
                                `(3) run "gt continue" to continue executing your previous Graphite command`,
                            ]
                                .map((line) => chalk_1.default.yellow(line))
                                .join('\n'));
                            return;
                        case errors_1.ValidationFailedError:
                            (0, utils_1.logError)(`Validation: ${err.message}`);
                            (0, utils_1.logInfo)(utils_1.VALIDATION_HELPER_MESSAGE);
                            throw err;
                        case errors_1.ConfigError:
                            (0, utils_1.logError)(`Bad Config: ${err.message}`);
                            throw err;
                        case errors_1.ExitCancelledError:
                            (0, utils_1.logWarn)(`Cancelled: ${err.message}`);
                            return;
                        case errors_1.SiblingBranchError:
                            (0, utils_1.logError)(err.message);
                            throw err;
                        case errors_1.MultiParentError:
                            (0, utils_1.logError)(err.message);
                            throw err;
                        case errors_1.KilledError:
                            return; // don't log output if user manually kills.
                        default:
                            (0, utils_1.logError)(err.message);
                            throw err;
                    }
                }
            }));
        }
        catch (err) {
            const end = Date.now();
            if (config_1.execStateConfig.outputDebugLogs()) {
                (0, utils_1.logInfo)(err);
                (0, utils_1.logInfo)(err.stack);
            }
            (0, _1.postTelemetryInBackground)({
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
        (0, _1.postTelemetryInBackground)({
            canonicalCommandName: canonicalName,
            commandName: parsedArgs.command,
            durationMiliSeconds: end - start,
        });
    });
}
exports.profile = profile;
//# sourceMappingURL=profile.js.map