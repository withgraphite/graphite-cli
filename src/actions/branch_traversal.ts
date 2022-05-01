import chalk from 'chalk';
import prompts from 'prompts';
import { TContext } from '../lib/context/context';
import { ExitFailedError, KilledError } from '../lib/errors';
import { currentBranchPrecondition } from '../lib/preconditions';
import { checkoutBranch, logInfo } from '../lib/utils';
import { Branch } from '../wrapper-classes/branch';

export enum TraversalDirection {
  Top = 'TOP',
  Bottom = 'BOTTOM',
  Up = 'UP',
  Down = 'DOWN',
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
  direction: TraversalDirection.Down | TraversalDirection.Bottom,
  context: TContext,
  numSteps?: number
): string | undefined {
  let branch = currentBranch;
  let prevBranch = branch.getParentFromMeta(context);
  let indent = 0;

  // Bottom goes to the bottom of the stack but down can go up to trunk
  if (direction === TraversalDirection.Down && prevBranch?.isTrunk(context)) {
    branch = prevBranch;
    indent++;
  }
  while (prevBranch && !prevBranch.isTrunk(context)) {
    logInfo(`${'  '.repeat(indent)}↳(${branch})`);
    branch = prevBranch;
    prevBranch = branch.getParentFromMeta(context);
    indent++;
    if (direction === TraversalDirection.Down && indent === numSteps) {
      break;
    }
  }
  logInfo(`${'  '.repeat(indent)}↳(${chalk.cyan(branch)})`);
  return branch?.name;
}

async function getUpstackBranch(
  currentBranch: Branch,
  interactive: boolean,
  direction: TraversalDirection.Up | TraversalDirection.Top,
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
        branch = Branch.branchWithName(stack_base_branch, context);
      } else {
        throw new ExitFailedError(
          `Cannot get upstack branch, multiple choices available: [${candidates.join(
            ', '
          )}]`
        );
      }
    }
    indent++;
    if (direction === TraversalDirection.Up && indent === numSteps) {
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
  const nextBranch = await getNextBranch(
    direction,
    currentBranch,
    context,
    opts
  );
  if (nextBranch && nextBranch != currentBranch.name) {
    checkoutBranch(nextBranch);
  } else {
    logInfo(
      `Already at the ${
        direction === TraversalDirection.Down ||
        direction === TraversalDirection.Bottom
          ? 'bottom most'
          : 'top most'
      } branch in the stack. Exiting.`
    );
  }
}

async function getNextBranch(
  direction: TraversalDirection,
  currentBranch: Branch,
  context: TContext,
  opts: { numSteps?: number | undefined; interactive: boolean }
) {
  switch (direction) {
    case TraversalDirection.Bottom: {
      return getDownstackBranch(
        currentBranch,
        TraversalDirection.Bottom,
        context
      );
    }
    case TraversalDirection.Down: {
      return getDownstackBranch(
        currentBranch,
        TraversalDirection.Down,
        context,
        opts.numSteps
      );
    }
    case TraversalDirection.Top: {
      return await getUpstackBranch(
        currentBranch,
        opts.interactive,
        TraversalDirection.Top,
        context
      );
    }
    case TraversalDirection.Up: {
      return await getUpstackBranch(
        currentBranch,
        opts.interactive,
        TraversalDirection.Up,
        context,
        opts.numSteps
      );
    }
  }
}
