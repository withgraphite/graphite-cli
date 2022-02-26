import chalk from 'chalk';
import { execSync } from 'child_process';
import prompts from 'prompts';
import { TContext } from '../lib/context/context';
import { ExitFailedError, KilledError } from '../lib/errors';
import { currentBranchPrecondition } from '../lib/preconditions';
import { logInfo } from '../lib/utils';
import { Branch } from '../wrapper-classes/branch';

export enum TraversalDirection {
  Top = 'TOP',
  Bottom = 'BOTTOM',
  Next = 'NEXT',
  Previous = 'PREV',
}

async function getStackBranch(candidates: Branch[]): Promise<string> {
  return (
    await prompts(
      {
        type: 'select',
        name: 'branch',
        message:
          'Multiple branches found at the same level. Select a branch to guide the navigation',
        choices: candidates.map((b) => {
          return { title: b.name, value: b.name, branch: b };
        }),
      },
      {
        onCancel: () => {
          throw new KilledError();
        },
      }
    )
  ).branch;
}

function getDownstackBranch(
  currentBranch: Branch,
  direction: TraversalDirection.Previous | TraversalDirection.Bottom,
  context: TContext,
  numSteps?: number
): string | undefined {
  let branch = currentBranch;
  let prevBranch = branch.getParentFromMeta(context);
  let indent = 0;

  // Bottom goes to the bottom of the stack but prev can go up to trunk
  if (
    direction === TraversalDirection.Previous &&
    prevBranch?.isTrunk(context)
  ) {
    branch = prevBranch;
    indent++;
  }
  while (prevBranch && !prevBranch.isTrunk(context)) {
    logInfo(`${'  '.repeat(indent)}↳(${branch})`);
    branch = prevBranch;
    prevBranch = branch.getParentFromMeta(context);
    indent++;
    if (direction === TraversalDirection.Previous && indent === numSteps) {
      break;
    }
  }
  logInfo(`${'  '.repeat(indent)}↳(${chalk.cyan(branch)})`);
  return branch?.name;
}

async function getUpstackBranch(
  currentBranch: Branch,
  interactive: boolean,
  direction: TraversalDirection.Next | TraversalDirection.Top,
  context: TContext,
  numSteps?: number
): Promise<string | undefined> {
  let branch = currentBranch;
  let candidates = branch.getChildrenFromMeta(context);
  let indent = 0;

  while (branch && candidates.length) {
    if (candidates.length === 1) {
      logInfo(`${'  '.repeat(indent)}↳(${branch})`);
      branch = candidates[0];
    } else {
      if (interactive) {
        const stack_base_branch = await getStackBranch(candidates);
        branch = await Branch.branchWithName(stack_base_branch, context);
      } else {
        throw new ExitFailedError(
          `Cannot get next branch, multiple choices available: [${candidates.join(
            ', '
          )}]`
        );
      }
    }
    indent++;
    if (direction === TraversalDirection.Next && indent === numSteps) {
      break;
    }
    candidates = branch.getChildrenFromMeta(context);
  }

  logInfo(`${'  '.repeat(indent)}↳(${chalk.cyan(branch)})`);
  return branch?.name;
}

export async function switchBranchAction(
  direction: TraversalDirection,
  opts: {
    numSteps?: number;
    interactive: boolean;
  },
  context: TContext
): Promise<void> {
  const currentBranch = currentBranchPrecondition(context);
  let nextBranch;
  switch (direction) {
    case TraversalDirection.Bottom: {
      nextBranch = getDownstackBranch(
        currentBranch,
        TraversalDirection.Bottom,
        context
      );
      break;
    }
    case TraversalDirection.Previous: {
      nextBranch = getDownstackBranch(
        currentBranch,
        TraversalDirection.Previous,
        context,
        opts.numSteps
      );
      break;
    }
    case TraversalDirection.Top: {
      nextBranch = await getUpstackBranch(
        currentBranch,
        opts.interactive,
        TraversalDirection.Top,
        context
      );
      break;
    }
    case TraversalDirection.Next: {
      nextBranch = await getUpstackBranch(
        currentBranch,
        opts.interactive,
        TraversalDirection.Next,
        context,
        opts.numSteps
      );
      break;
    }
  }
  if (nextBranch && nextBranch != currentBranch.name) {
    execSync(`git checkout "${nextBranch}"`, { stdio: 'ignore' });
    logInfo(`Switched to ${nextBranch}`);
  } else {
    logInfo(
      `Already at the ${
        direction === TraversalDirection.Previous ||
        direction === TraversalDirection.Bottom
          ? 'bottom most'
          : 'top most'
      } branch in the stack. Exiting.`
    );
  }
}
