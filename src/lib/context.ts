import {
  continueConfigFactory,
  TContinueConfig,
} from './config/continue_config';
import { messageConfigFactory, TMessageConfig } from './config/message_config';
import { repoConfigFactory, TRepoConfig } from './config/repo_config';
import { surveyConfigFactory, TSurveyConfig } from './config/survey_config';
import { TUserConfig, userConfigFactory } from './config/user_config';
import { composeMetaCache, TMetaCache } from './engine/cache';
import { composeSplog, TSplog } from './utils/splog';

export const USER_CONFIG_OVERRIDE_ENV = 'GRAPHITE_USER_CONFIG_PATH' as const;

export type TContext = {
  splog: TSplog;
  interactive: boolean;
  repoConfig: TRepoConfig;
  surveyConfig: TSurveyConfig;
  userConfig: TUserConfig;
  messageConfig: TMessageConfig;
  continueConfig: TContinueConfig;
  metaCache: TMetaCache;
};

export function initContext(opts?: {
  globalArguments?: {
    interactive?: boolean;
    quiet?: boolean;
    verify?: boolean;
    debug?: boolean;
  };
  userConfigOverride?: string;
}): TContext {
  const repoConfig = repoConfigFactory.load();
  const userConfig = userConfigFactory.load(
    opts?.userConfigOverride ?? process.env[USER_CONFIG_OVERRIDE_ENV]
  );
  const splog = composeSplog({
    quiet: opts?.globalArguments?.quiet,
    outputDebugLogs: opts?.globalArguments?.debug,
    tips: userConfig.data.tips,
  });
  const continueConfig = continueConfigFactory.load();
  const metaCache = composeMetaCache({
    trunkName: repoConfig.data.trunk,
    currentBranchOverride: continueConfig?.data.currentBranchOverride,
    splog,
    noVerify: !(opts?.globalArguments?.verify ?? true),
  });
  return {
    splog,
    interactive: opts?.globalArguments?.interactive ?? true,
    repoConfig,
    surveyConfig: surveyConfigFactory.load(),
    userConfig,
    messageConfig: messageConfigFactory.load(),
    continueConfig,
    metaCache,
  };
}
