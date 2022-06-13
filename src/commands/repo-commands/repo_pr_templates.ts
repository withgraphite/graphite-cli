import yargs from 'yargs';
import { graphite } from '../../lib/runner';
import { getPRTemplateFilepaths } from '../../lib/utils/pr_templates';

const args = {} as const;

type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;

export const command = 'pr-templates';
export const canonical = 'repo pr-templates';
export const description =
  'A list of your GitHub PR templates. These are used to pre-fill the bodies of your PRs created using the submit command.';
export const builder = args;
export const handler = async (argv: argsT): Promise<void> => {
  return graphite(argv, canonical, async (context) => {
    context.splog.info(getPRTemplateFilepaths().join('\n'));
  });
};
