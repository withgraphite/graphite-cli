import { execSync } from 'child_process';
import yargs from 'yargs';
import { profile } from '../../lib/telemetry';

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
    try {
      execSync(
        `git log --graph --abbrev-commit --decorate --format=format:'%C(bold blue)%h%C(reset) - %C(bold green)(%ar)%C(reset) %C(white)%s%C(reset) %C(dim white)- %an%C(reset)%C(auto)%d%C(reset)' --branches`,
        { stdio: 'inherit' }
      );
    } catch (e) {
      // Ignore errors (this just means they quit git log)
    }
  });
};
