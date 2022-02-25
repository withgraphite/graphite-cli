import { repoConfigFactory } from './../config/repo_config';
export declare type TContext = {
    repoConfig: ReturnType<typeof repoConfigFactory.load>;
};
export declare function initContext(): TContext;
