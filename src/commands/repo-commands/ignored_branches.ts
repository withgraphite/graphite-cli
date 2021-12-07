import yargs from 'yargs';
import { repoConfig } from '../../lib/config';
import { profile } from '../../lib/telemetry';
import { gpExecSync, logInfo, logWarn } from '../../lib/utils';
import chalk from 'chalk';

const args = {
  add: {
    demandOption: false,
    default: false,
    type: 'string',
    describe: 'Add a branch to be ignored by Graphite.',
  },
} as const;

type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;

export const command = 'ignored-branches';
export const canonical = 'repo ignore-branches';
export const description =
  'Specify glob patterns matching branch names for Graphite to ignore. ' +
  'Often branches that you never plan to create PRs and merge into trunk.';
export const builder = args;
export const handler = async (argv: argsT): Promise<void> => {
  return profile(argv, canonical, async () => {
    if (argv.add) {
      const foundBranches = findMatches(argv.add);
      if (foundBranches.length) {
        logInfo(
          chalk.gray(`The following branches were found matching your pattern:`)
        );
        foundBranches.forEach((branch) => {
          logInfo(chalk.gray(branch.trim()));
        });
      } else {
        logWarn(
          `No branches were found matching the provided pattern. Please make sure it is correct.`
        );
      }
      repoConfig.addIgnoreBranches([argv.add]);
      logInfo(`Added (${argv.add}) to be ignored`);
    } else {
      const ignoredBranches = repoConfig.getIgnoreBranches();
      if (ignoredBranches.length) {
        logInfo(`The following patterns are being ignored by Graphite:`);
        logInfo(ignoredBranches.join('\n'));
      } else {
        logInfo('No ignored branches');
      }
    }
  });
};

function findMatches(branchName: string): string[] {
  return gpExecSync({ command: `git branch --list '${branchName}'` })
    .toString()
    .split('\n');
}
