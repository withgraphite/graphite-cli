import yargs from 'yargs';
import { editDownstack } from '../../actions/edit/edit_downstack';
import { graphite } from '../../lib/runner';

const args = {
  input: {
    describe: `Path to file specifying stack edits. Using this argument skips prompting for stack edits and assumes the user has already formatted a list. Primarly used for unit tests.`,
    demandOption: false,
    hidden: true,
    type: 'string',
  },
} as const;
type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;

export const command = 'edit';
export const canonical = 'downstack edit';
export const description =
  'Edit the order of the branches between trunk and the current branch.  Each child of one of these branches that is not explicitly listed will keep the same parent, but may be restacked.';
export const builder = args;
export const aliases = ['e'];

export const handler = async (argv: argsT): Promise<void> => {
  return graphite(argv, canonical, async (context) => {
    await editDownstack(argv.input, context);
  });
};
