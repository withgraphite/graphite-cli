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
};

export function initContext(): TContext {
  return {
    repoConfig: repoConfigFactory.load(),
    surveyConfig: surveyConfigFactory.load(),
    userConfig: userConfigFactory.load(process.env[USER_CONFIG_OVERRIDE_ENV]),
    messageConfig: messageConfigFactory.load(),
  };
}
