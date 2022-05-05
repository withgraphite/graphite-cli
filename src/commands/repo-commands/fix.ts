import chalk from 'chalk';
import yargs from 'yargs';
import { deleteMergedBranches } from '../../actions/clean_branches';
import { fixDanglingBranches } from '../../actions/fix_dangling_branches';
import { TContext } from '../../lib/context/context';
import { profile } from '../../lib/telemetry';
import { logInfo, logNewline, logTip } from '../../lib/utils/splog';
import { Branch } from '../../wrapper-classes/branch';

const args = {
  force: {
    describe: `Don't prompt you to confirm whether to take a remediation (may include deleting already-merged branches and setting branch parents).`,
    demandOption: false,
    default: false,
    type: 'boolean',
    alias: 'f',
  },
  'show-delete-progress': {
    describe: `Show progress through merged branches.`,
    demandOption: false,
    default: false,
    type: 'boolean',
  },
} as const;

type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;

export const command = 'fix';
export const canonical = 'repo fix';
export const description =
  'Search for and remediate common problems in your repo that slow Graphite down and/or cause bugs (e.g. stale branches, branches with unknown parents).';
export const builder = args;
export const handler = async (argv: argsT): Promise<void> => {
  return profile(argv, canonical, async (context) => {
    await fixDanglingBranches(context, { force: argv.force });

    branchCountSanityCheck(context);

    const continuationFrame = {
      op: 'REPO_FIX_BRANCH_COUNT_SANTIY_CHECK_CONTINUATION' as const,
    };

    await deleteMergedBranches(
      {
        frame: {
          op: 'DELETE_BRANCHES_CONTINUATION',
          showDeleteProgress: argv['show-delete-progress'],
          force: argv.force,
        },
        parent: [continuationFrame],
      },
      context
    );

    deleteMergedBranchesContinuation();
  });
};

function branchCountSanityCheck(context: TContext): void {
  const branchCount = Branch.allBranches(context).length;
  if (branchCount > 50) {
    console.log(
      chalk.yellow(
        `Found ${branchCount} total branches in the local repo which may be causing performance issues with Graphite. We recommend culling as many unneeded branches as possible to optimize Graphite performance.`
      )
    );
    logTip(
      `To further reduce Graphite's search space, you can also tune the maximum days and/or stacks Graphite tracks behind trunk using \`gt repo max-days-behind-trunk --set\` or \`gt repo max-stacks-behind-trunk --set\`.`,
      context
    );
    logNewline();
  }
}

export function deleteMergedBranchesContinuation(): void {
  logNewline();
  logInfo(
    `Still seeing issues with Graphite? Send us feedback via \`gt feedback '<your_issue'> --with-debug-context\` and we'll dig in!`
  );
}
