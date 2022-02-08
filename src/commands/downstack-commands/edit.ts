import yargs from 'yargs';
import { editDownstack } from '../../actions/edit/edit_downstack';
import { profile } from '../../lib/telemetry';

const args = {} as const;
type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;

export const command = 'edit';
export const canonical = 'downstack edit';
export const description = 'Edit the order of the branchs in the stack.';
export const builder = args;
export const aliases = ['e'];

export const handler = async (argv: argsT): Promise<void> => {
  return profile(argv, canonical, async () => {
    await editDownstack();
  });
};
