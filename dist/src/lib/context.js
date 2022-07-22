"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initContext = exports.initContextLite = exports.USER_CONFIG_OVERRIDE_ENV = void 0;
const sync_pr_info_1 = require("../actions/sync_pr_info");
const cache_1 = require("./engine/cache");
const rebase_in_progress_1 = require("./git/rebase_in_progress");
const continuation_spf_1 = require("./spiffy/continuation_spf");
const pr_info_spf_1 = require("./spiffy/pr_info_spf");
const repo_config_spf_1 = require("./spiffy/repo_config_spf");
const survey_responses_spf_1 = require("./spiffy/survey_responses_spf");
const upgrade_message_spf_1 = require("./spiffy/upgrade_message_spf");
const user_config_spf_1 = require("./spiffy/user_config_spf");
const splog_1 = require("./utils/splog");
exports.USER_CONFIG_OVERRIDE_ENV = 'GRAPHITE_USER_CONFIG_PATH';
function initContextLite(opts) {
    const userConfig = user_config_spf_1.userConfigFactory.load(process.env[exports.USER_CONFIG_OVERRIDE_ENV]);
    const splog = (0, splog_1.composeSplog)({
        quiet: opts?.quiet,
        outputDebugLogs: opts?.debug,
        tips: userConfig.data.tips,
    });
    return {
        splog,
        interactive: opts?.interactive ?? true,
        surveyConfig: survey_responses_spf_1.surveyConfigFactory.load(),
        userConfig,
        messageConfig: upgrade_message_spf_1.messageConfigFactory.load(),
    };
}
exports.initContextLite = initContextLite;
function initContext(contextLite, opts) {
    const repoConfig = repo_config_spf_1.repoConfigFactory.load();
    if (!(0, rebase_in_progress_1.rebaseInProgress)()) {
        continuation_spf_1.continueConfigFactory.load().delete();
    }
    const continueConfig = continuation_spf_1.continueConfigFactory.load();
    const metaCache = (0, cache_1.composeMetaCache)({
        trunkName: repoConfig.data.trunk,
        currentBranchOverride: continueConfig.data.currentBranchOverride,
        splog: contextLite.splog,
        noVerify: !(opts?.verify ?? true),
        remote: repoConfig.getRemote(),
        restackCommitterDateIsAuthorDate: contextLite.userConfig.data.restackCommitterDateIsAuthorDate,
    });
    const prInfoConfig = pr_info_spf_1.prInfoConfigFactory.loadIfExists();
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