import yargs from 'yargs';
import { profile } from '../../lib/telemetry/profile';
import { validate } from '../../lib/validation/validate';

export const command = 'migration';
export const canonical = 'dev migration';
export const aliases = ['mig'];
export const description = false;

const args = {} as const;
export const builder = args;

type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;
export const handler = async (argv: argsT): Promise<void> => {
  return profile(argv, canonical, async (context) => {
    validate(context);
  });
};
