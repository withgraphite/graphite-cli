import { repoConfigFactory } from './../config/repo_config';
export type TContext = {
  repoConfig: ReturnType<typeof repoConfigFactory.load>;
};

export function initContext(): TContext {
  return { repoConfig: repoConfigFactory.load() };
}
