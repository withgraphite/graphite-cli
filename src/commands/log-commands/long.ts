import yargs from 'yargs';
import { graphite } from '../../lib/runner';
import { gpExecSync } from '../../lib/utils/exec_sync';

const args = {} as const;

export const command = 'long';
export const description =
  'Display a graph of the commit ancestry of all branches.';
export const builder = args;
export const aliases = ['l'];
export const canonical = 'log long';

type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;
export const handler = async (argv: argsT): Promise<void> => {
  return graphite(argv, canonical, async () => {
    // If this flag is passed, print the old logging style:
    gpExecSync({
      command: `git log --graph --abbrev-commit --decorate --format=format:'%C(bold blue)%h%C(reset) - %C(bold green)(%ar)%C(reset) %C(white)%s%C(reset) %C(dim white)- %an%C(reset)%C(auto)%d%C(reset)' --branches`,
      options: { stdio: 'inherit' },
      onError: 'throw',
    });
  });
};
