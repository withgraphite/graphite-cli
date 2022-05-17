import { mergeConflictCallstackConfigFactory } from './config/merge_conflict_callstack_config';
import { messageConfigFactory } from './config/message_config';
import { repoConfigFactory } from './config/repo_config';
import { surveyConfigFactory } from './config/survey_config';
import { userConfigFactory } from './config/user_config';
export declare const USER_CONFIG_OVERRIDE_ENV: "GRAPHITE_USER_CONFIG_PATH";
export declare type TContext = {
    repoConfig: ReturnType<typeof repoConfigFactory.load>;
    surveyConfig: ReturnType<typeof surveyConfigFactory.load>;
    userConfig: ReturnType<typeof userConfigFactory.load>;
    messageConfig: ReturnType<typeof messageConfigFactory.load>;
    mergeConflictCallstackConfig: ReturnType<typeof mergeConflictCallstackConfigFactory.loadIfExists>;
};
export declare function initContext(userConfigOverride?: string): TContext;
