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
exports.profile = void 0;
// Why does an open source CLI include telemetry?
// We the creators want to understand how people are using the tool
// All metrics logged are listed plain to see, and are non blocking in case the server is unavailable.
var chalk_1 = require("chalk");
var _1 = require(".");
var package_json_1 = require("../../../package.json");
var init_1 = require("../../actions/init");
var config_1 = require("../config");
var errors_1 = require("../errors");
var utils_1 = require("../utils");
var merge_conflict_help_1 = require("../utils/merge_conflict_help");
var context_1 = require("./context");
var tracer_1 = require("./tracer");
function profile(args, canonicalName, handler) {
    return __awaiter(this, void 0, void 0, function () {
        var parsedArgs, start, err_1, end_1, end;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    parsedArgs = utils_1.parseArgs(args);
                    start = Date.now();
                    _1.registerSigintHandler({
                        commandName: parsedArgs.command,
                        canonicalCommandName: canonicalName,
                        startTime: start
                    });
                    if (!(parsedArgs.command !== 'repo init' && !config_1.repoConfig.getTrunk())) return [3 /*break*/, 2];
                    utils_1.logInfo("Graphite has not been initialized, attempting to setup now...");
                    utils_1.logNewline();
                    return [4 /*yield*/, init_1.init()];
                case 1:
                    _a.sent();
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, tracer_1["default"].span({
                            name: 'command',
                            resource: parsedArgs.command,
                            meta: {
                                user: context_1.getUserEmail() || 'NotFound',
                                version: package_json_1.version,
                                args: parsedArgs.args,
                                alias: parsedArgs.alias
                            }
                        }, function () { return __awaiter(_this, void 0, void 0, function () {
                            var err_2;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        _a.trys.push([0, 2, , 3]);
                                        return [4 /*yield*/, handler()];
                                    case 1:
                                        _a.sent();
                                        return [3 /*break*/, 3];
                                    case 2:
                                        err_2 = _a.sent();
                                        switch (err_2.constructor) {
                                            case errors_1.ExitFailedError:
                                                utils_1.logError(err_2.message);
                                                throw err_2;
                                            case errors_1.PreconditionsFailedError:
                                                utils_1.logInfo(err_2.message);
                                                throw err_2;
                                            case errors_1.RebaseConflictError:
                                                utils_1.logNewline();
                                                utils_1.logError("Rebase conflict. " + err_2.message);
                                                utils_1.logNewline();
                                                merge_conflict_help_1.printGraphiteMergeConflictStatus();
                                                utils_1.logNewline();
                                                utils_1.logInfo([
                                                    "To fix and continue your previous Graphite command:",
                                                    "(1) resolve the listed merge conflicts",
                                                    "(2) mark them as resolved with \"git add\"",
                                                    "(3) run \"gt continue\" to continue executing your previous Graphite command",
                                                ]
                                                    .map(function (line) { return chalk_1["default"].yellow(line); })
                                                    .join('\n'));
                                                return [2 /*return*/];
                                            case errors_1.ValidationFailedError:
                                                utils_1.logError("Validation: " + err_2.message);
                                                utils_1.logInfo(utils_1.VALIDATION_HELPER_MESSAGE);
                                                throw err_2;
                                            case errors_1.ConfigError:
                                                utils_1.logError("Bad Config: " + err_2.message);
                                                throw err_2;
                                            case errors_1.ExitCancelledError:
                                                utils_1.logWarn("Cancelled: " + err_2.message);
                                                return [2 /*return*/];
                                            case errors_1.SiblingBranchError:
                                                utils_1.logError(err_2.message);
                                                throw err_2;
                                            case errors_1.MultiParentError:
                                                utils_1.logError(err_2.message);
                                                throw err_2;
                                            case errors_1.KilledError:
                                                return [2 /*return*/]; // don't log output if user manually kills.
                                            default:
                                                utils_1.logError(err_2.message);
                                                throw err_2;
                                        }
                                        return [3 /*break*/, 3];
                                    case 3: return [2 /*return*/];
                                }
                            });
                        }); })];
                case 3:
                    _a.sent();
                    return [3 /*break*/, 5];
                case 4:
                    err_1 = _a.sent();
                    end_1 = Date.now();
                    if (config_1.execStateConfig.outputDebugLogs()) {
                        utils_1.logInfo(err_1);
                        utils_1.logInfo(err_1.stack);
                    }
                    _1.postTelemetryInBackground({
                        canonicalCommandName: canonicalName,
                        commandName: parsedArgs.command,
                        durationMiliSeconds: end_1 - start,
                        err: {
                            errName: err_1.name,
                            errMessage: err_1.message,
                            errStack: err_1.stack || ''
                        }
                    });
                    // eslint-disable-next-line no-restricted-syntax
                    process.exit(1);
                    return [3 /*break*/, 5];
                case 5:
                    end = Date.now();
                    _1.postTelemetryInBackground({
                        canonicalCommandName: canonicalName,
                        commandName: parsedArgs.command,
                        durationMiliSeconds: end - start
                    });
                    return [2 /*return*/];
            }
        });
    });
}
exports.profile = profile;
