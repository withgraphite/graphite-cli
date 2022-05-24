import yargs from 'yargs';
import { profile } from '../../lib/telemetry/profile';
import { gpExecSync } from '../../lib/utils/exec_sync';

const args = {} as const;

export const command = 'long';
export const description = 'Log all stacks tracked by Graphite.';
export const builder = args;
export const aliases = ['l'];
export const canonical = 'log long';

type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;
export const handler = async (argv: argsT): Promise<void> => {
  return profile(argv, canonical, async () => {
    // If this flag is passed, print the old logging style:
    gpExecSync({
      command: `git log --graph --abbrev-commit --decorate --format=format:'%C(bold blue)%h%C(reset) - %C(bold green)(%ar)%C(reset) %C(white)%s%C(reset) %C(dim white)- %an%C(reset)%C(auto)%d%C(reset)' --branches`,
      options: { stdio: 'inherit' },
    });
  });
};
