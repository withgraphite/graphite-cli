import chalk from 'chalk';
import fs from 'fs-extra';
import yargs from 'yargs';
import { captureState, recreateState } from '../../lib/debug-context';
import { profile } from '../../lib/telemetry';
import { logInfo } from '../../lib/utils/splog';

const args = {
  recreate: {
    type: 'string',
    optional: true,
    alias: 'r',
    describe:
      'Accepts a json block created by `gt feedback state`. Recreates a debug repo in a temp folder with a commit tree matching the state JSON.',
  },
  'recreate-from-file': {
    type: 'string',
    optional: true,
    alias: 'f',
    describe:
      'Accepts a file containing a json block created by `gt feedback state`. Recreates a debug repo in a temp folder with a commit tree matching the state JSON.',
  },
} as const;
type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;

export const command = 'debug-context';
export const canonical = 'feedback debug-context';
export const description =
  'Print a debug summary of your repo. Useful for creating bug report details.';
export const builder = args;

export const handler = async (argv: argsT): Promise<void> => {
  return profile(argv, canonical, async (context) => {
    if (argv['recreate-from-file']) {
      const dir = recreateState(
        fs.readFileSync(argv['recreate-from-file']).toString(),
        context
      );
      logInfo(`${chalk.green(dir)}`);
    } else if (argv.recreate) {
      const dir = recreateState(argv.recreate, context);
      logInfo(`${chalk.green(dir)}`);
    } else {
      logInfo(captureState(context));
    }
  });
};
