"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initContext = exports.USER_CONFIG_OVERRIDE_ENV = void 0;
const merge_conflict_callstack_config_1 = require("../config/merge_conflict_callstack_config");
const message_config_1 = require("./../config/message_config");
const repo_config_1 = require("./../config/repo_config");
const survey_config_1 = require("./../config/survey_config");
const user_config_1 = require("./../config/user_config");
exports.USER_CONFIG_OVERRIDE_ENV = 'GRAPHITE_USER_CONFIG_PATH';
function initContext(userConfigOverride) {
    return {
        repoConfig: repo_config_1.repoConfigFactory.load(),
        surveyConfig: survey_config_1.surveyConfigFactory.load(),
        userConfig: user_config_1.userConfigFactory.load(userConfigOverride !== null && userConfigOverride !== void 0 ? userConfigOverride : process.env[exports.USER_CONFIG_OVERRIDE_ENV]),
        messageConfig: message_config_1.messageConfigFactory.load(),
        mergeConflictCallstackConfig: merge_conflict_callstack_config_1.mergeConflictCallstackConfigFactory.loadIfExists(),
    };
}
exports.initContext = initContext;
//# sourceMappingURL=context.js.map