import yargs from 'yargs';
import { init } from '../../actions/init';
import { graphite } from '../../lib/runner';

const args = {
  trunk: {
    describe: `The name of your trunk branch.`,
    demandOption: false,
    optional: true,
    type: 'string',
  },
} as const;

type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;

export const command = 'init';
export const aliases = ['i'];
export const canonical = 'repo init';
export const description =
  'Create or regenerate a `.graphite_repo_config` file.';
export const builder = args;
export const handler = async (argv: argsT): Promise<void> => {
  return graphite(argv, canonical, async (context) => {
    await init(context, argv.trunk);
  });
};
