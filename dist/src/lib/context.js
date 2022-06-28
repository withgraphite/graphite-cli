"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initContext = exports.initContextLite = exports.USER_CONFIG_OVERRIDE_ENV = void 0;
const sync_pr_info_1 = require("../actions/sync_pr_info");
const continue_config_1 = require("./config/continue_config");
const message_config_1 = require("./config/message_config");
const pr_info_config_1 = require("./config/pr_info_config");
const repo_config_1 = require("./config/repo_config");
const survey_config_1 = require("./config/survey_config");
const user_config_1 = require("./config/user_config");
const cache_1 = require("./engine/cache");
const splog_1 = require("./utils/splog");
exports.USER_CONFIG_OVERRIDE_ENV = 'GRAPHITE_USER_CONFIG_PATH';
function initContextLite(opts) {
    const userConfig = user_config_1.userConfigFactory.load(process.env[exports.USER_CONFIG_OVERRIDE_ENV]);
    const splog = (0, splog_1.composeSplog)({
        quiet: opts?.quiet,
        outputDebugLogs: opts?.debug,
        tips: userConfig.data.tips,
    });
    return {
        splog,
        interactive: opts?.interactive ?? true,
        surveyConfig: survey_config_1.surveyConfigFactory.load(),
        userConfig,
        messageConfig: message_config_1.messageConfigFactory.load(),
    };
}
exports.initContextLite = initContextLite;
function initContext(contextLite, opts) {
    const repoConfig = repo_config_1.repoConfigFactory.load();
    const continueConfig = continue_config_1.continueConfigFactory.load();
    const metaCache = (0, cache_1.composeMetaCache)({
        trunkName: repoConfig.data.trunk,
        currentBranchOverride: continueConfig?.data.currentBranchOverride,
        splog: contextLite.splog,
        noVerify: !(opts?.verify ?? true),
        remote: repoConfig.getRemote(),
    });
    continueConfig?.update((data) => (data.currentBranchOverride = undefined));
    const prInfoConfig = pr_info_config_1.prInfoConfigFactory.loadIfExists();
    if (prInfoConfig) {
        (0, sync_pr_info_1.upsertPrInfoForBranches)(prInfoConfig.data.prInfoToUpsert ?? [], metaCache);
        prInfoConfig.delete();
    }
    return {
        ...contextLite,
        repoConfig,
        continueConfig,
        metaCache,
    };
}
exports.initContext = initContext;
//# sourceMappingURL=context.js.map