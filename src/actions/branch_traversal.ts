#!/usr/bin/env node
import chalk from 'chalk';
import { execSync } from 'child_process';
import prompts from 'prompts';
import { ExitFailedError, KilledError } from '../lib/errors';
import { currentBranchPrecondition } from '../lib/preconditions';
import { logInfo } from '../lib/utils';
import Branch from '../wrapper-classes/branch';

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
  numSteps?: number
): string | undefined {
  let branch = currentBranch;
  let prevBranch = branch.getParentFromMeta();
  let indent = 0;

  // Bottom goes to the bottom of the stack but prev can go up to trunk
  if (direction === TraversalDirection.Previous && prevBranch?.isTrunk()) {
    branch = prevBranch;
    indent++;
  }
  while (prevBranch && !prevBranch.isTrunk()) {
    logInfo(`${'  '.repeat(indent)}↳(${branch})`);
    branch = prevBranch;
    prevBranch = branch.getParentFromMeta();
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
  numSteps?: number
): Promise<string | undefined> {
  let branch = currentBranch;
  let candidates = branch.getChildrenFromMeta();
  let indent = 0;

  while (branch && candidates.length) {
    if (candidates.length === 1) {
      logInfo(`${'  '.repeat(indent)}↳(${branch})`);
      branch = candidates[0];
    } else {
      if (interactive) {
        const stack_base_branch = await getStackBranch(candidates);
        branch = await Branch.branchWithName(stack_base_branch);
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
    candidates = branch.getChildrenFromMeta();
  }

  logInfo(`${'  '.repeat(indent)}↳(${chalk.cyan(branch)})`);
  return branch?.name;
}

export async function switchBranchAction(
  direction: TraversalDirection,
  opts: {
    numSteps?: number;
    interactive: boolean;
  }
): Promise<void> {
  const currentBranch = currentBranchPrecondition();
  let nextBranch;
  switch (direction) {
    case TraversalDirection.Bottom: {
      nextBranch = getDownstackBranch(currentBranch, TraversalDirection.Bottom);
      break;
    }
    case TraversalDirection.Previous: {
      nextBranch = getDownstackBranch(
        currentBranch,
        TraversalDirection.Previous,
        opts.numSteps
      );
      break;
    }
    case TraversalDirection.Top: {
      nextBranch = await getUpstackBranch(
        currentBranch,
        opts.interactive,
        TraversalDirection.Top
      );
      break;
    }
    case TraversalDirection.Next: {
      nextBranch = await getUpstackBranch(
        currentBranch,
        opts.interactive,
        TraversalDirection.Next,
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
        direction === TraversalDirection.Previous || TraversalDirection.Bottom
          ? 'bottom most'
          : 'top most'
      } branch in the stack. Exiting.`
    );
  }
}
