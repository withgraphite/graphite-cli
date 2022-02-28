import { TContext } from '../lib/context/context';
import { ValidationFailedError } from '../lib/errors';
import { currentBranchPrecondition } from '../lib/preconditions';
import { logInfo } from '../lib/utils';
import { GitStackBuilder, MetaStackBuilder, Stack } from '../wrapper-classes';
import { Branch } from '../wrapper-classes/branch';
import { TScope } from './scope';
import { TSubmitScope } from './submit/submit';

export function validateStack(
  scope: TSubmitScope,
  stack: Stack,
  context: TContext
): void {
  const branch = currentBranchPrecondition(context);
  switch (scope) {
    case 'FULLSTACK': {
      const gitStack = new GitStackBuilder().fullStackFromBranch(
        branch,
        context
      );
      compareStacks(stack, gitStack);
      break;
    }
    case 'UPSTACK': {
      const gitStack =
        new GitStackBuilder().upstackInclusiveFromBranchWithParents(
          branch,
          context
        );
      // Since we're modifying the stack, we want to make sure not to modify
      // the passed-in value. We re-derive the stack here but can improve this
      // in the future by just deep-copying the stack.
      const metadataStack =
        new MetaStackBuilder().upstackInclusiveFromBranchWithParents(
          branch,
          context
        );
      metadataStack.source.parent = undefined;
      gitStack.source.parent = undefined;
      compareStacks(metadataStack, gitStack);
      break;
    }
    case 'DOWNSTACK': {
      const gitStack = new GitStackBuilder().downstackFromBranch(
        branch,
        context
      );
      // Since we're modifying the stack, we want to make sure not to modify
      // the passed-in value. We re-derive the stack here but can improve this
      // in the future by just deep-copying the stack.
      const metadataStack = new MetaStackBuilder().downstackFromBranch(
        branch,
        context
      );
      metadataStack.source.children = [];
      gitStack.source.children = [];
      compareStacks(metadataStack, gitStack);
      break;
    }
  }
  logInfo(`Validation for current stack: passed`);
}

export function validate(scope: TScope, context: TContext): void {
  const branch = currentBranchPrecondition(context);
  switch (scope) {
    case 'UPSTACK':
      validateBranchUpstackInclusive(branch, context);
      break;
    case 'DOWNSTACK':
      validateBranchDownstackInclusive(branch, context);
      break;
    case 'FULLSTACK':
      validateBranchFullstack(branch, context);
      break;
  }
  logInfo(`Current stack is valid`);
}

function validateBranchFullstack(branch: Branch, context: TContext): void {
  const metaStack = new MetaStackBuilder().fullStackFromBranch(branch, context);
  const gitStack = new GitStackBuilder().fullStackFromBranch(branch, context);

  compareStacks(metaStack, gitStack);
}

function validateBranchDownstackInclusive(
  branch: Branch,
  context: TContext
): void {
  const metaStack = new MetaStackBuilder().downstackFromBranch(branch, context);
  const gitStack = new GitStackBuilder().downstackFromBranch(branch, context);

  compareStacks(metaStack, gitStack);
}

function validateBranchUpstackInclusive(
  branch: Branch,
  context: TContext
): void {
  const metaStack =
    new MetaStackBuilder().upstackInclusiveFromBranchWithParents(
      branch,
      context
    );
  const gitStack = new GitStackBuilder().upstackInclusiveFromBranchWithParents(
    branch,
    context
  );
  metaStack.source.parent = undefined;
  gitStack.source.parent = undefined;

  compareStacks(metaStack, gitStack);
}

function compareStacks(metaStack: Stack, gitStack: Stack): void {
  if (!metaStack.equals(gitStack)) {
    throw new ValidationFailedError(
      [
        `Graphite stack does not match git-derived stack\n`,
        '\nGraphite Stack:',
        metaStack.toString(),
        '\nGit Stack:',
        gitStack.toString(),
      ].join('\n')
    );
  }
}
