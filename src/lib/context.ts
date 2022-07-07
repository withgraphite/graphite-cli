import { upsertPrInfoForBranches } from '../actions/sync_pr_info';
import { composeMetaCache, TMetaCache } from './engine/cache';
import { rebaseInProgress } from './git/rebase_in_progress';
import {
  continueConfigFactory,
  TContinueConfig,
} from './spiffy/continuation_spf';
import { prInfoConfigFactory } from './spiffy/pr_info_spf';
import { repoConfigFactory, TRepoConfig } from './spiffy/repo_config_spf';
import {
  surveyConfigFactory,
  TSurveyConfig,
} from './spiffy/survey_responses_spf';
import {
  messageConfigFactory,
  TMessageConfig,
} from './spiffy/upgrade_message_spf';
import { TUserConfig, userConfigFactory } from './spiffy/user_config_spf';
import { composeSplog, TSplog } from './utils/splog';

export const USER_CONFIG_OVERRIDE_ENV = 'GRAPHITE_USER_CONFIG_PATH' as const;

export type TContextLite = {
  splog: TSplog;
  interactive: boolean;
  surveyConfig: TSurveyConfig;
  userConfig: TUserConfig;
  messageConfig: TMessageConfig;
};

type TRepoContext = {
  repoConfig: TRepoConfig;
  continueConfig: TContinueConfig;
  metaCache: TMetaCache;
};

export function initContextLite(opts?: {
  interactive?: boolean;
  quiet?: boolean;
  debug?: boolean;
}): TContextLite {
  const userConfig = userConfigFactory.load(
    process.env[USER_CONFIG_OVERRIDE_ENV]
  );
  const splog = composeSplog({
    quiet: opts?.quiet,
    outputDebugLogs: opts?.debug,
    tips: userConfig.data.tips,
  });

  return {
    splog,
    interactive: opts?.interactive ?? true,
    surveyConfig: surveyConfigFactory.load(),
    userConfig,
    messageConfig: messageConfigFactory.load(),
  };
}

export type TContext = TRepoContext & TContextLite;

export function initContext(
  contextLite: TContextLite,
  opts?: {
    verify?: boolean;
  }
): TContext {
  const repoConfig = repoConfigFactory.load();
  const continueConfig = continueConfigFactory.load();
  if (!rebaseInProgress()) {
    continueConfig.delete();
  }
  const metaCache = composeMetaCache({
    trunkName: repoConfig.data.trunk,
    currentBranchOverride: continueConfig?.data.currentBranchOverride,
    splog: contextLite.splog,
    noVerify: !(opts?.verify ?? true),
    remote: repoConfig.getRemote(),
    restackCommitterDateIsAuthorDate:
      contextLite.userConfig.data.restackCommitterDateIsAuthorDate,
  });
  const prInfoConfig = prInfoConfigFactory.loadIfExists();
  if (prInfoConfig) {
    upsertPrInfoForBranches(prInfoConfig.data.prInfoToUpsert ?? [], metaCache);
    prInfoConfig.delete();
  }
  return {
    ...contextLite,
    repoConfig,
    continueConfig,
    metaCache,
  };
}
