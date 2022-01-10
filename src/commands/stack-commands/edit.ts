import yargs from 'yargs';
import { profile } from '../../lib/telemetry';
import { editAction } from '../../actions/stack_edit';

export const command = 'edit';
export const canonical = 'stack edit';
export const description =
  'This command allows you to edit your stack. Options for edit are: reorder';

const args = {} as const;
type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;
export const builder = args;
export const aliases = ['e'];

export const handler = async (argv: argsT): Promise<void> => {
  return profile(argv, canonical, async () => {
    await editAction();
  });
};
