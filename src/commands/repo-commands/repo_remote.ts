import yargs from 'yargs';
import { profile } from '../../lib/telemetry';
import { logInfo } from '../../lib/utils';

const args = {
  set: {
    optional: false,
    type: 'string',
    alias: 's',
    describe:
      "Override the name of the remote repository. Only set this if you are using a remote other than 'origin'.",
  },
} as const;

type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;

export const command = 'owner';
export const canonical = 'repo remote';
export const description =
  "Specifies the remote that graphite pushes to/pulls from (defaults to 'origin')";
export const builder = args;
export const handler = async (argv: argsT): Promise<void> => {
  return profile(argv, canonical, async (context) => {
    if (argv.set) {
      context.repoConfig.setRemote(argv.set);
    } else {
      logInfo(context.repoConfig.getRemote());
    }
  });
};
