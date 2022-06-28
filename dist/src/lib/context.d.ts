import { TContinueConfig } from './config/continue_config';
import { TMessageConfig } from './config/message_config';
import { TRepoConfig } from './config/repo_config';
import { TSurveyConfig } from './config/survey_config';
import { TUserConfig } from './config/user_config';
import { TMetaCache } from './engine/cache';
import { TSplog } from './utils/splog';
export declare const USER_CONFIG_OVERRIDE_ENV: "GRAPHITE_USER_CONFIG_PATH";
export declare type TContextLite = {
    splog: TSplog;
    interactive: boolean;
    surveyConfig: TSurveyConfig;
    userConfig: TUserConfig;
    messageConfig: TMessageConfig;
};
declare type TRepoContext = {
    repoConfig: TRepoConfig;
    continueConfig: TContinueConfig;
    metaCache: TMetaCache;
};
export declare function initContextLite(opts?: {
    interactive?: boolean;
    quiet?: boolean;
    debug?: boolean;
}): TContextLite;
export declare type TContext = TRepoContext & TContextLite;
export declare function initContext(contextLite: TContextLite, opts?: {
    verify?: boolean;
}): TContext;
export {};
