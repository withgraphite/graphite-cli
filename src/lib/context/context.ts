import { mergeConflictCallstackConfigFactory } from '../config/merge_conflict_callstack_config';
import { messageConfigFactory } from './../config/message_config';
import { repoConfigFactory } from './../config/repo_config';
import { surveyConfigFactory } from './../config/survey_config';
import { userConfigFactory } from './../config/user_config';

export const USER_CONFIG_OVERRIDE_ENV = 'GRAPHITE_USER_CONFIG_PATH' as const;

export type TContext = {
  repoConfig: ReturnType<typeof repoConfigFactory.load>;
  surveyConfig: ReturnType<typeof surveyConfigFactory.load>;
  userConfig: ReturnType<typeof userConfigFactory.load>;
  messageConfig: ReturnType<typeof messageConfigFactory.load>;
  mergeConflictCallstackConfig: ReturnType<
    typeof mergeConflictCallstackConfigFactory.loadIfExists
  >;
};

export function initContext(userConfigOverride?: string): TContext {
  return {
    repoConfig: repoConfigFactory.load(),
    surveyConfig: surveyConfigFactory.load(),
    userConfig: userConfigFactory.load(
      userConfigOverride ?? process.env[USER_CONFIG_OVERRIDE_ENV]
    ),
    messageConfig: messageConfigFactory.load(),
    mergeConflictCallstackConfig:
      mergeConflictCallstackConfigFactory.loadIfExists(),
  };
}
