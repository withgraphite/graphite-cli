import yargs from 'yargs';
import { editDownstack } from '../../actions/edit/edit_downstack';
import { profile } from '../../lib/telemetry/profile';

const args = {
  input: {
    describe: `Path to file specifying stack edits. Using this argument skips prompting for stack edits and assumes the user has already formatted a list. Primarly used for unit tests.`,
    demandOption: false,
    default: false,
    hidden: true,
    type: 'string',
  },
} as const;
type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;

export const command = 'edit';
export const canonical = 'downstack edit';
export const description = 'Edit the order of the branchs in the stack.';
export const builder = args;
export const aliases = ['e'];

export const handler = async (argv: argsT): Promise<void> => {
  return profile(argv, canonical, async (context) => {
    await editDownstack(
      context,
      argv.input ? { inputPath: argv.input } : undefined
    );
  });
};
