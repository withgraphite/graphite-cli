import chalk from 'chalk';
import yargs from 'yargs';
import { deleteMergedBranches } from '../../actions/clean_branches';
import {
  existsDanglingBranches,
  fixDanglingBranches,
} from '../../actions/fix_dangling_branches';
import { TRepoFixBranchCountSanityCheckStackFrame } from '../../lib/config/merge_conflict_callstack_config';
import { TContext } from '../../lib/context/context';
import { profile } from '../../lib/telemetry';
import { logInfo, logNewline, logTip } from '../../lib/utils';
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
    await branchMetadataSanityChecks(argv.force, context);
    await branchCountSanityCheck(
      {
        force: argv.force,
        showDeleteProgress: argv['show-delete-progress'],
      },
      context
    );
  });
};

async function branchMetadataSanityChecks(
  force: boolean,
  context: TContext
): Promise<void> {
  logInfo(`Ensuring tracked branches in Graphite are all well-formed...`);
  if (existsDanglingBranches(context)) {
    logNewline();
    console.log(
      chalk.yellow(
        `Found branches without a known parent to Graphite. This may cause issues detecting stacks; we recommend you select one of the proposed remediations or use \`gt upstack onto\` to restack the branch onto the appropriate parent.`
      )
    );
    logTip(
      `To ensure Graphite always has a known parent for your branch, create your branch through Graphite with \`gt branch create <branch_name>\`.`,
      context
    );
    logNewline();
    await fixDanglingBranches(context, force);
    logNewline();
  } else {
    logInfo(`All branches well-formed.`);
    logNewline();
  }
}

async function branchCountSanityCheck(
  opts: {
    force: boolean;
    showDeleteProgress: boolean;
  },
  context: TContext
): Promise<void> {
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

  logInfo(`Searching for any stale branches that can be removed...`);

  const continuationFrame = {
    op: 'REPO_FIX_BRANCH_COUNT_SANTIY_CHECK_CONTINUATION' as const,
  };

  await deleteMergedBranches(
    {
      frame: {
        op: 'DELETE_BRANCHES_CONTINUATION',
        showDeleteProgress: opts.showDeleteProgress,
        force: opts.force,
      },
      parent: [continuationFrame, 'TOP_OF_CALLSTACK_WITH_NOTHING_AFTER'],
    },
    context
  );

  await branchCountSanityCheckContinuation(continuationFrame);
}

export async function branchCountSanityCheckContinuation(
  frame: TRepoFixBranchCountSanityCheckStackFrame
): Promise<void> {
  logNewline();
  logInfo(
    `Still seeing issues with Graphite? Send us feedback via \`gt feedback '<your_issue'> --with-debug-context\` and we'll dig in!`
  );
}
