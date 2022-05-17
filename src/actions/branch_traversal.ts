import chalk from 'chalk';
import prompts from 'prompts';
import { TContext } from '../lib/context';
import { ExitFailedError, KilledError } from '../lib/errors';
import { logInfo } from '../lib/utils/splog';

export enum TraversalDirection {
  Top = 'TOP',
  Bottom = 'BOTTOM',
  Up = 'UP',
  Down = 'DOWN',
}

async function getStackBranch(candidates: string[]): Promise<string> {
  return (
    await prompts(
      {
        type: 'select',
        name: 'value',
        message:
          'Multiple branches found at the same level. Select a branch to guide the navigation',
        choices: candidates.map((b) => {
          return { title: b, value: b };
        }),
      },
      {
        onCancel: () => {
          throw new KilledError();
        },
      }
    )
  ).value;
}

function getDownstackBranch(
  currentBranch: string,
  direction: TraversalDirection.Down | TraversalDirection.Bottom,
  context: TContext,
  numSteps?: number
): string | undefined {
  let branch = currentBranch;
  let prevBranch = context.metaCache.getParent(branch);
  let indent = 0;

  // Bottom goes to the bottom of the stack but down can go up to trunk
  if (
    direction === TraversalDirection.Down &&
    prevBranch &&
    context.metaCache.isTrunk(prevBranch)
  ) {
    branch = prevBranch;
    indent++;
  }
  while (prevBranch && !context.metaCache.isTrunk(prevBranch)) {
    logInfo(`${'  '.repeat(indent)}↳(${branch})`);
    branch = prevBranch;
    prevBranch = context.metaCache.getParent(branch);
    indent++;
    if (direction === TraversalDirection.Down && indent === numSteps) {
      break;
    }
  }
  logInfo(`${'  '.repeat(indent)}↳(${chalk.cyan(branch)})`);
  return branch;
}

async function getUpstackBranch(
  currentBranch: string,
  interactive: boolean,
  direction: TraversalDirection.Up | TraversalDirection.Top,
  context: TContext,
  numSteps?: number
): Promise<string | undefined> {
  let branch = currentBranch;
  let candidates = context.metaCache.getChildren(branch);
  let indent = 0;

  while (branch && candidates && candidates.length) {
    if (candidates.length === 1) {
      logInfo(`${'  '.repeat(indent)}↳(${branch})`);
      branch = candidates[0];
    } else {
      if (interactive) {
        branch = await getStackBranch(candidates);
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
    candidates = context.metaCache.getChildren(branch);
  }

  logInfo(`${'  '.repeat(indent)}↳(${chalk.cyan(branch)})`);
  return branch;
}

export async function switchBranchAction(
  direction: TraversalDirection,
  opts: {
    numSteps?: number;
    interactive: boolean;
  },
  context: TContext
): Promise<void> {
  const currentBranch = context.metaCache.currentBranchPrecondition;
  const nextBranch = await getNextBranch(
    direction,
    currentBranch,
    context,
    opts
  );
  if (nextBranch && nextBranch != currentBranch) {
    context.metaCache.checkoutBranch(nextBranch);
  } else {
    logInfo(
      `Already at the ${
        direction === TraversalDirection.Down ||
        direction === TraversalDirection.Bottom
          ? 'bottom most'
          : 'top most'
      } branch in the stack.`
    );
  }
}

async function getNextBranch(
  direction: TraversalDirection,
  currentBranch: string,
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
