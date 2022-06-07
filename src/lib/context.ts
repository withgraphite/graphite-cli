import { mergeConflictCallstackConfigFactory } from './config/merge_conflict_callstack_config';
import { messageConfigFactory } from './config/message_config';
import { repoConfigFactory } from './config/repo_config';
import { surveyConfigFactory } from './config/survey_config';
import { userConfigFactory } from './config/user_config';
import { composeMetaCache, TMetaCache } from './state/cache';
import { composeSplog, TSplog } from './utils/splog';

export const USER_CONFIG_OVERRIDE_ENV = 'GRAPHITE_USER_CONFIG_PATH' as const;

export type TContext = {
  splog: TSplog;
  interactive: boolean;
  noVerify: boolean;
  repoConfig: ReturnType<typeof repoConfigFactory.load>;
  surveyConfig: ReturnType<typeof surveyConfigFactory.load>;
  userConfig: ReturnType<typeof userConfigFactory.load>;
  messageConfig: ReturnType<typeof messageConfigFactory.load>;
  mergeConflictCallstackConfig: ReturnType<
    typeof mergeConflictCallstackConfigFactory.load
  >;
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
  const mergeConflictCallstackConfig =
    mergeConflictCallstackConfigFactory.load();
  const metaCache = composeMetaCache({
    trunkName: repoConfig.data.trunk,
    currentBranchOverride:
      mergeConflictCallstackConfig?.data.currentBranchOverride,
    splog,
  });
  return {
    splog,
    interactive: opts?.globalArguments?.interactive ?? true,
    noVerify: !(opts?.globalArguments?.verify ?? true),
    repoConfig,
    surveyConfig: surveyConfigFactory.load(),
    userConfig,
    messageConfig: messageConfigFactory.load(),
    mergeConflictCallstackConfig,
    metaCache,
  };
}
