import chalk from 'chalk';
import yargs from 'yargs';
import { getBranchTitle } from '../../actions/print_stack';
import { currentBranchPrecondition } from '../../lib/preconditions';
import { syncPRInfoForBranches } from '../../lib/sync/pr_info';
import { profile } from '../../lib/telemetry';
import { logError } from '../../lib/utils';

const args = {
  reset: {
    describe: `Removes current GitHub PR information linked to the current branch`,
    demandOption: false,
    type: 'boolean',
  },
} as const;
type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;

export const aliases = [];
export const command = 'sync';
export const canoncial = 'branch sync';
export const description =
  'Fetch GitHub PR information for the current branch.';
export const builder = args;
export const handler = async (argv: argsT): Promise<void> => {
  return profile(argv, canoncial, async (context) => {
    const branch = currentBranchPrecondition(context);

    if (argv.reset) {
      branch.clearPRInfo();
      return;
    }

    await syncPRInfoForBranches([branch], context);

    const prInfo = branch.getPRInfo();
    if (prInfo === undefined) {
      logError(
        `Could not find associated PR. Please double-check that a PR exists on GitHub in repo ${chalk.bold(
          context.repoConfig.getRepoName()
        )} for the branch ${chalk.bold(branch.name)}.`
      );
      return;
    }

    console.log(
      getBranchTitle(branch, {
        currentBranch: null,
        offTrunk: false,
        visited: [],
      })
    );

    const prTitle = prInfo.title;
    if (prTitle !== undefined) {
      console.log(prTitle);
    }

    const prURL = prInfo.url;
    if (prURL !== undefined) {
      console.log(prURL);
    }
  });
};
