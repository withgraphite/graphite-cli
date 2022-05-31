import chalk from 'chalk';
import yargs from 'yargs';
import { profile } from '../../lib/telemetry/profile';
import { gpExecSync } from '../../lib/utils/exec_sync';

const args = {
  add: {
    demandOption: false,
    default: false,
    type: 'string',
    describe: 'Add a branch or glob pattern to be ignored by Graphite.',
  },
  remove: {
    demandOption: false,
    default: false,
    type: 'string',
    describe: 'Remove a branch or glob pattern from being ignored by Graphite.',
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
  return profile(argv, canonical, async (context) => {
    if (argv.add) {
      const foundBranches = findMatches(argv.add);
      if (foundBranches.length) {
        context.splog.logInfo(
          chalk.gray(`The following branches were found matching your pattern:`)
        );
        foundBranches.split('\n').forEach((branch) => {
          context.splog.logInfo(chalk.gray(branch.trim()));
        });
      } else {
        context.splog.logWarn(
          `No branches were found matching the provided pattern. Please make sure it is correct.`
        );
      }
      context.repoConfig.addIgnoreBranchPatterns([argv.add]);
      context.splog.logInfo(`Added (${argv.add}) to be ignored`);
    } else if (argv.remove) {
      if (context.repoConfig.getIgnoreBranches().includes(argv.remove)) {
        context.repoConfig.removeIgnoreBranches(argv.remove);
        context.splog.logInfo(
          `Removed pattern (${argv.remove}) from ignore list`
        );
      } else {
        context.splog.logInfo(`No pattern matching (${argv.remove}) found.`);
      }
    } else {
      const ignoredBranches = context.repoConfig.getIgnoreBranches();
      if (ignoredBranches.length) {
        context.splog.logInfo(
          `The following patterns are being ignored by Graphite:`
        );
        context.splog.logInfo(ignoredBranches.join('\n'));
      } else {
        context.splog.logInfo('No ignored branches');
      }
    }
  });
};

function findMatches(branchName: string): string {
  return gpExecSync({ command: `git branch --list '${branchName}'` });
}
