import chalk from 'chalk';
import prompts from 'prompts';
import { TContext } from '../../lib/context';
import { KilledError } from '../../lib/errors';
import { TScopeSpec } from '../../lib/state/scope_spec';
import { syncPRInfoForBranches } from '../../lib/sync/pr_info';

export async function getValidBranchesToSubmit(
  scope: TScopeSpec,
  context: TContext
): Promise<string[]> {
  context.splog.logInfo(
    chalk.blueBright(
      `✏️  Validating that this Graphite stack is ready to submit...`
    )
  );

  const branchNames = context.metaCache
    .getCurrentStack(scope)
    .filter((b) => !context.metaCache.isTrunk(b));
  context.splog.logNewline();

  await syncPRInfoForBranches(branchNames, context);

  return hasAnyMergedBranches(branchNames, context) ||
    hasAnyClosedBranches(branchNames, context) ||
    needsRestacking(branchNames, context) ||
    (await shouldNotSubmitDueToEmptyBranches(branchNames, context))
    ? []
    : branchNames;
}

function hasAnyMergedBranches(
  branchNames: string[],
  context: TContext
): boolean {
  const mergedBranches = branchNames.filter(
    (b) => context.metaCache.getPrInfo(b)?.state === 'MERGED'
  );
  if (mergedBranches.length === 0) {
    return false;
  }

  const hasMultipleBranches = mergedBranches.length > 1;

  context.splog.logError(
    `PR${hasMultipleBranches ? 's' : ''} for the following branch${
      hasMultipleBranches ? 'es have' : ' has'
    } already been merged:`
  );
  mergedBranches.forEach((b) => context.splog.logError(`▸ ${chalk.reset(b)}`));
  context.splog.logError(
    `If this is expected, you can use 'gt repo sync' to delete ${
      hasMultipleBranches ? 'these branches' : 'this branch'
    } locally and restack dependencies.`
  );

  return true;
}

function hasAnyClosedBranches(
  branchNames: string[],
  context: TContext
): boolean {
  const closedBranches = branchNames.filter(
    (b) => context.metaCache.getPrInfo(b)?.state === 'CLOSED'
  );
  if (closedBranches.length === 0) {
    return false;
  }

  const hasMultipleBranches = closedBranches.length > 1;

  context.splog.logError(
    `PR${hasMultipleBranches ? 's' : ''} for the following branch${
      hasMultipleBranches ? 'es have' : ' has'
    } been closed:`
  );
  closedBranches.forEach((b) => context.splog.logError(`▸ ${chalk.reset(b)}`));
  context.splog.logError(
    `To submit ${
      hasMultipleBranches ? 'these branches' : 'this branch'
    }, please reopen the PR remotely.`
  );

  return true;
}

function needsRestacking(branchNames: string[], context: TContext): boolean {
  if (branchNames.every(context.metaCache.isBranchFixed)) {
    return false;
  }
  context.splog.logWarn(
    [
      `You are trying to submit at least one branch that has not been restacked.`,
      `Run the corresponding restack command and try again.`,
    ].join('\n')
  );
  return true;
}

export async function shouldNotSubmitDueToEmptyBranches(
  branchNames: string[],
  context: TContext
): Promise<boolean> {
  const emptyBranches = branchNames.filter(context.metaCache.isBranchEmpty);
  if (emptyBranches.length === 0) {
    return false;
  }

  const hasMultipleBranches = emptyBranches.length > 1;

  context.splog.logWarn(
    `The following branch${
      hasMultipleBranches ? 'es have' : ' has'
    } no changes:`
  );
  emptyBranches.forEach((b) => context.splog.logWarn(`▸ ${chalk.reset(b)}`));
  if (!context.interactive) {
    context.splog.logWarn(
      `Aborting non-interactive submit.  This warning can be bypassed in interactive mode.`
    );
    return true;
  }
  context.splog.logWarn(
    `Are you sure you want to submit ${hasMultipleBranches ? 'them' : 'it'}?`
  );
  context.splog.logNewline();

  const response = await prompts(
    {
      type: 'select',
      name: 'empty_branches_options',
      message: `How would you like to proceed?`,
      choices: [
        {
          title: `Abort command and keep working on ${
            hasMultipleBranches ? 'these branches' : 'this branch'
          }`,
          value: 'abort',
        },
        {
          title: `Continue with empty branch${hasMultipleBranches ? 'es' : ''}`,
          value: 'continue',
        },
      ],
    },
    {
      onCancel: () => {
        throw new KilledError();
      },
    }
  );
  context.splog.logNewline();

  return response.empty_branches_options === 'abort';
}
