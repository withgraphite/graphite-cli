import chalk from 'chalk';
import prompts from 'prompts';
import { TContext } from '../../lib/context';
import { ExitFailedError, KilledError } from '../../lib/errors';
import { syncPrInfo } from '../sync_pr_info';

export async function validateBranchesToSubmit(
  branchNames: string[],
  context: TContext
): Promise<string[]> {
  context.splog.logInfo(
    chalk.blueBright(
      `✏️  Validating that this Graphite stack is ready to submit...`
    )
  );

  context.splog.logNewline();

  await syncPrInfo(branchNames, context);

  validateNoMergedOrClosedBranches(branchNames, context);
  await validateNoEmptyBranches(branchNames, context);
  validateBaseRevisions(branchNames, context);

  return branchNames;
}

function validateNoMergedOrClosedBranches(
  branchNames: string[],
  context: TContext
): boolean {
  const mergedOrClosedBranches = branchNames.filter((b) =>
    ['MERGED', 'CLOSED'].includes(context.metaCache.getPrInfo(b)?.state ?? '')
  );
  if (mergedOrClosedBranches.length === 0) {
    return false;
  }

  const hasMultipleBranches = mergedOrClosedBranches.length > 1;
  context.splog.logTip(
    `You can use repo sync to find and delete all merged/closed branches automatically and rebase their children.`
  );

  throw new ExitFailedError(
    [
      `PR${hasMultipleBranches ? 's' : ''} for the following branch${
        hasMultipleBranches ? 'es have' : ' has'
      } already been merged or closed:`,
      ...mergedOrClosedBranches.map((b) => `▸ ${chalk.reset(b)}`),
    ].join('\n')
  );
}

// We want to ensure that for each branch, either:
// 1. Its parent is trunk
// 2. We are submitting its parent before it and it does not need restacking
// 3. Its base matches the existing head for its parent's PR
function validateBaseRevisions(branchNames: string[], context: TContext): void {
  const validatedBranches = new Set<string>();
  for (const branchName of branchNames) {
    const parentBranchName =
      context.metaCache.getParentPrecondition(branchName);
    if (context.metaCache.isTrunk(parentBranchName)) {
      // valid
    } else if (validatedBranches.has(parentBranchName)) {
      if (!context.metaCache.isBranchFixed(branchName)) {
        throw new ExitFailedError(
          [
            `You are trying to submit at least one branch that has not been restacked.`,
            `Please restack upstack from ${chalk.yellow(
              branchName
            )} and try again.`,
          ].join('\n')
        );
      }
    } else {
      if (!context.metaCache.baseMatchesRemoteParent(branchName)) {
        throw new ExitFailedError(
          [
            `You are trying to submit at least one branch whose base does not match its parent remotely, without including its parent.`,
            `Please include downstack from ${chalk.yellow(
              branchName
            )} in your submit scope and try again.`,
          ].join('\n')
        );
      }
    }
    validatedBranches.add(branchName);
  }
}

export async function validateNoEmptyBranches(
  branchNames: string[],
  context: TContext
): Promise<void> {
  const emptyBranches = branchNames.filter(context.metaCache.isBranchEmpty);
  if (emptyBranches.length === 0) {
    return;
  }

  const hasMultipleBranches = emptyBranches.length > 1;

  context.splog.logWarn(
    `The following branch${
      hasMultipleBranches ? 'es have' : ' has'
    } no changes:`
  );
  emptyBranches.forEach((b) => context.splog.logWarn(`▸ ${chalk.reset(b)}`));
  context.splog.logWarn(
    `Are you sure you want to submit ${hasMultipleBranches ? 'them' : 'it'}?`
  );
  context.splog.logNewline();
  if (!context.interactive) {
    throw new ExitFailedError(`Aborting non-interactive submit.`);
  }

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
  if (response.empty_branches_options.abort) {
    throw new KilledError();
  }
  context.splog.logNewline();
}
