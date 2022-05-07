import chalk from 'chalk';
import yargs from 'yargs';
import { branchExistsPrecondition } from '../../lib/preconditions';
import { profile } from '../../lib/telemetry';
import { getTrunk } from '../../lib/utils/trunk';

const args = {
  set: {
    demandOption: false,
    default: false,
    type: 'string',
    alias: 's',
    describe:
      "Override the value of the repo's trunk branch in the Graphite config.",
  },
} as const;

export const command = 'trunk';
export const canonical = 'repo trunk';
export const description =
  'The trunk branch of the current repo. Graphite uses the trunk branch as the base of all stacks.';
export const builder = args;

type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;
export const handler = async (argv: argsT): Promise<void> => {
  return profile(argv, canonical, async (context) => {
    if (argv.set) {
      branchExistsPrecondition(argv.set);
      context.repoConfig.setTrunk(argv.set);
    } else {
      console.log(`(${chalk.green(getTrunk(context))})`);
    }
  });
};
