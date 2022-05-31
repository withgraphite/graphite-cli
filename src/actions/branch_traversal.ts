import chalk from 'chalk';
import prompts from 'prompts';
import { TContext } from '../lib/context';
import { ExitFailedError, KilledError } from '../lib/errors';

// eslint-disable-next-line max-params
function traverseDownward(
  currentBranchName: string,
  context: TContext,
  stepsRemaining: number | 'bottom' = 'bottom',
  indent = 0
): string {
  context.splog.logInfo(
    `${'  '.repeat(indent)}↳ ${chalk.blue(currentBranchName)}`
  );
  if (stepsRemaining === 0 || context.metaCache.isTrunk(currentBranchName)) {
    return currentBranchName;
  }
  const parentBranchName =
    context.metaCache.getParentPrecondition(currentBranchName);
  if (
    stepsRemaining === 'bottom' &&
    context.metaCache.isTrunk(parentBranchName)
  ) {
    return currentBranchName;
  }
  return traverseDownward(
    parentBranchName,
    context,
    stepsRemaining === 'bottom' ? 'bottom' : stepsRemaining - 1,
    indent + 1
  );
}

// eslint-disable-next-line max-params
async function traverseUpward(
  currentBranchName: string,
  context: TContext,
  stepsRemaining: number | 'top' = 'top',
  indent = 0
): Promise<string> {
  context.splog.logInfo(
    `${'  '.repeat(indent)}↳ ${chalk.blue(currentBranchName)}`
  );
  if (stepsRemaining === 0) {
    return currentBranchName;
  }
  const children = context.metaCache.getChildren(currentBranchName);
  if (children.length === 0) {
    return currentBranchName;
  }
  const childBranchName =
    children.length === 1
      ? children[0]
      : await handleMultipleChildren(children, context);
  return await traverseUpward(
    childBranchName,
    context,
    stepsRemaining === 'top' ? 'top' : stepsRemaining - 1,
    indent + 1
  );
}

async function handleMultipleChildren(children: string[], context: TContext) {
  if (!context.interactive) {
    throw new ExitFailedError(
      `Cannot get upstack branch in non-interactive mode; multiple choices available:\n${children.join(
        '\n'
      )}`
    );
  }
  return (
    await prompts(
      {
        type: 'select',
        name: 'value',
        message:
          'Multiple branches found at the same level. Select a branch to guide the navigation',
        choices: children.map((b) => {
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

type TBranchNavigation =
  | {
      direction: 'UP' | 'DOWN';
      numSteps: number;
    }
  | { direction: 'TOP' | 'BOTTOM' };
export async function switchBranchAction(
  branchNavigation: TBranchNavigation,
  context: TContext
): Promise<void> {
  const currentBranchName = context.metaCache.currentBranchPrecondition;
  const newBranchName = await traverseBranches(
    branchNavigation,
    currentBranchName,
    context
  );
  if (newBranchName !== currentBranchName) {
    context.metaCache.checkoutBranch(newBranchName);
    context.splog.logInfo(`Checked out ${chalk.cyan(newBranchName)}.`);
    return;
  }
  context.splog.logInfo(
    `Already at the ${
      branchNavigation.direction === 'DOWN' ||
      branchNavigation.direction === 'BOTTOM'
        ? 'bottom most'
        : 'top most'
    } branch in the stack.`
  );
}

async function traverseBranches(
  branchNavigation: TBranchNavigation,
  fromBranchName: string,
  context: TContext
): Promise<string> {
  switch (branchNavigation.direction) {
    case 'BOTTOM': {
      return traverseDownward(fromBranchName, context);
    }
    case 'DOWN': {
      return traverseDownward(
        fromBranchName,
        context,
        branchNavigation.numSteps
      );
    }
    case 'TOP': {
      return await traverseUpward(fromBranchName, context);
    }
    case 'UP': {
      return await traverseUpward(
        fromBranchName,
        context,
        branchNavigation.numSteps
      );
    }
  }
}
