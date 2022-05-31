"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initContext = exports.USER_CONFIG_OVERRIDE_ENV = void 0;
const merge_conflict_callstack_config_1 = require("./config/merge_conflict_callstack_config");
const message_config_1 = require("./config/message_config");
const repo_config_1 = require("./config/repo_config");
const survey_config_1 = require("./config/survey_config");
const user_config_1 = require("./config/user_config");
const splog_1 = require("./utils/splog");
exports.USER_CONFIG_OVERRIDE_ENV = 'GRAPHITE_USER_CONFIG_PATH';
function initContext(opts) {
    var _a, _b, _c, _d, _e, _f, _g;
    const userConfig = user_config_1.userConfigFactory.load((_a = opts === null || opts === void 0 ? void 0 : opts.userConfigOverride) !== null && _a !== void 0 ? _a : process.env[exports.USER_CONFIG_OVERRIDE_ENV]);
    return {
        splog: splog_1.composeSplog({
            quiet: (_b = opts === null || opts === void 0 ? void 0 : opts.globalArguments) === null || _b === void 0 ? void 0 : _b.quiet,
            outputDebugLogs: (_c = opts === null || opts === void 0 ? void 0 : opts.globalArguments) === null || _c === void 0 ? void 0 : _c.debug,
            tips: userConfig.data.tips,
        }),
        interactive: (_e = (_d = opts === null || opts === void 0 ? void 0 : opts.globalArguments) === null || _d === void 0 ? void 0 : _d.interactive) !== null && _e !== void 0 ? _e : true,
        noVerify: !((_g = (_f = opts === null || opts === void 0 ? void 0 : opts.globalArguments) === null || _f === void 0 ? void 0 : _f.verify) !== null && _g !== void 0 ? _g : true),
        repoConfig: repo_config_1.repoConfigFactory.load(),
        surveyConfig: survey_config_1.surveyConfigFactory.load(),
        userConfig,
        messageConfig: message_config_1.messageConfigFactory.load(),
        mergeConflictCallstackConfig: merge_conflict_callstack_config_1.mergeConflictCallstackConfigFactory.loadIfExists(),
    };
}
exports.initContext = initContext;
//# sourceMappingURL=context.js.map