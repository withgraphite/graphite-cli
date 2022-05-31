import chalk from 'chalk';
import prompts from 'prompts';
import { TContext } from '../../lib/context';
import {
  KilledError,
  PreconditionsFailedError,
  ValidationFailedError,
} from '../../lib/errors';
import { isEmptyBranch } from '../../lib/git/is_empty_branch';
import { currentBranchPrecondition } from '../../lib/preconditions';
import { syncPRInfoForBranches } from '../../lib/sync/pr_info';
import { Branch } from '../../wrapper-classes/branch';
import { validate } from '../validate';
import { TSubmitScope } from './submit_action';

export async function getValidBranchesToSubmit(
  scope: TSubmitScope,
  context: TContext
): Promise<Branch[]> {
  context.splog.logInfo(
    chalk.blueBright(
      `✏️  Validating that this Graphite stack is ready to submit...`
    )
  );

  const branchesToSubmit = getAllBranchesToSubmit(scope, context);
  context.splog.logNewline();

  await syncPRInfoForBranches(branchesToSubmit, context);

  return hasAnyMergedBranches(branchesToSubmit, context) ||
    hasAnyClosedBranches(branchesToSubmit, context)
    ? []
    : await checkForEmptyBranches(branchesToSubmit, context);
}

function getAllBranchesToSubmit(
  scope: TSubmitScope,
  context: TContext
): Branch[] {
  if (scope === 'BRANCH') {
    return [currentBranchPrecondition(context)];
  }

  try {
    return validate(scope, context);
  } catch {
    throw new ValidationFailedError(`Validation failed. Will not submit.`);
  }
}

function hasAnyMergedBranches(
  branchesToSubmit: Branch[],
  context: TContext
): boolean {
  const mergedBranches = branchesToSubmit.filter(
    (b) => b.getPRInfo()?.state === 'MERGED'
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
  mergedBranches.forEach((b) =>
    context.splog.logError(`▸ ${chalk.reset(b.name)}`)
  );
  context.splog.logError(
    `If this is expected, you can use 'gt repo sync' to delete ${
      hasMultipleBranches ? 'these branches' : 'this branch'
    } locally and restack dependencies.`
  );

  return true;
}

function hasAnyClosedBranches(
  branchesToSubmit: Branch[],
  context: TContext
): boolean {
  const closedBranches = branchesToSubmit.filter(
    (b) => b.getPRInfo()?.state === 'CLOSED'
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
  closedBranches.forEach((b) =>
    context.splog.logError(`▸ ${chalk.reset(b.name)}`)
  );
  context.splog.logError(
    `To submit ${
      hasMultipleBranches ? 'these branches' : 'this branch'
    }, please reopen the PR remotely.`
  );

  return true;
}

export async function checkForEmptyBranches(
  submittableBranches: Branch[],
  context: TContext
): Promise<Branch[]> {
  const emptyBranches = submittableBranches.filter((branch) =>
    isEmptyBranch(branch.name, getBranchBaseName(branch, context))
  );
  if (emptyBranches.length === 0) {
    return submittableBranches;
  }

  const hasMultipleBranches = emptyBranches.length > 1;

  context.splog.logWarn(
    `The following branch${
      hasMultipleBranches ? 'es have' : ' has'
    } no changes:`
  );
  emptyBranches.forEach((b) =>
    context.splog.logWarn(`▸ ${chalk.reset(b.name)}`)
  );
  context.splog.logWarn(
    `Are you sure you want to submit ${hasMultipleBranches ? 'them' : 'it'}?`
  );
  context.splog.logNewline();

  if (!context.interactive) {
    return [];
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
          value: 'fix_manually',
        },
        {
          title: `Continue with empty branch${hasMultipleBranches ? 'es' : ''}`,
          value: 'continue_empty',
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

  return response.empty_branches_options === 'continue_empty'
    ? submittableBranches
    : [];
}

function getBranchBaseName(branch: Branch, context: TContext): string {
  const parent = branch.getParentFromMeta(context);
  if (parent === undefined) {
    throw new PreconditionsFailedError(
      `Could not find parent for branch ${branch.name} to submit PR against. Please checkout ${branch.name} and run \`gt upstack onto <parent_branch>\` to set its parent.`
    );
  }
  return parent.name;
}
