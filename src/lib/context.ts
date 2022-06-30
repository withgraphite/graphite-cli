import { upsertPrInfoForBranches } from '../actions/sync_pr_info';
import {
  continueConfigFactory,
  TContinueConfig,
} from './config/continue_config';
import { messageConfigFactory, TMessageConfig } from './config/message_config';
import { prInfoConfigFactory } from './config/pr_info_config';
import { repoConfigFactory, TRepoConfig } from './config/repo_config';
import { surveyConfigFactory, TSurveyConfig } from './config/survey_config';
import { TUserConfig, userConfigFactory } from './config/user_config';
import { composeMetaCache, TMetaCache } from './engine/cache';
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
  const metaCache = composeMetaCache({
    trunkName: repoConfig.data.trunk,
    currentBranchOverride: continueConfig?.data.currentBranchOverride,
    splog: contextLite.splog,
    noVerify: !(opts?.verify ?? true),
    remote: repoConfig.getRemote(),
    restackCommitterDateIsAuthorDate:
      contextLite.userConfig.data.restackCommitterDateIsAuthorDate,
  });
  continueConfig?.update((data) => (data.currentBranchOverride = undefined));
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
