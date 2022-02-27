import { repoConfigFactory } from './../config/repo_config';
import { surveyConfigFactory } from './../config/survey_config';
export type TContext = {
  repoConfig: ReturnType<typeof repoConfigFactory.load>;
  surveyConfig: ReturnType<typeof surveyConfigFactory.load>;
};

export function initContext(): TContext {
  return {
    repoConfig: repoConfigFactory.load(),
    surveyConfig: surveyConfigFactory.load(),
  };
}
