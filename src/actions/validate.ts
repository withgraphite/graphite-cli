import { ValidationFailedError } from '../lib/errors';
import { currentBranchPrecondition } from '../lib/preconditions';
import { logInfo } from '../lib/utils';
import { GitStackBuilder, MetaStackBuilder, Stack } from '../wrapper-classes';
import Branch from '../wrapper-classes/branch';
import { TScope } from './scope';
import { TSubmitScope } from './submit/submit';

export function validateStack(scope: TSubmitScope, stack: Stack): void {
  const branch = currentBranchPrecondition();
  switch (scope) {
    case 'FULLSTACK': {
      const gitStack = new GitStackBuilder().fullStackFromBranch(branch);
      compareStacks(stack, gitStack);
      break;
    }
    case 'UPSTACK': {
      const gitStack =
        new GitStackBuilder().upstackInclusiveFromBranchWithParents(branch);
      // Since we're modifying the stack, we want to make sure not to modify
      // the passed-in value. We re-derive the stack here but can improve this
      // in the future by just deep-copying the stack.
      const metadataStack =
        new MetaStackBuilder().upstackInclusiveFromBranchWithParents(branch);
      metadataStack.source.parent = undefined;
      gitStack.source.parent = undefined;
      compareStacks(metadataStack, gitStack);
      break;
    }
    case 'DOWNSTACK': {
      const gitStack = new GitStackBuilder().downstackFromBranch(branch);
      // Since we're modifying the stack, we want to make sure not to modify
      // the passed-in value. We re-derive the stack here but can improve this
      // in the future by just deep-copying the stack.
      const metadataStack = new MetaStackBuilder().downstackFromBranch(branch);
      metadataStack.source.children = [];
      gitStack.source.children = [];
      compareStacks(metadataStack, gitStack);
      break;
    }
  }
  logInfo(`Validation for current stack: passed`);
}

export function validate(scope: TScope): void {
  const branch = currentBranchPrecondition();
  switch (scope) {
    case 'UPSTACK':
      validateBranchUpstackInclusive(branch);
      break;
    case 'DOWNSTACK':
      validateBranchDownstackInclusive(branch);
      break;
    case 'FULLSTACK':
      validateBranchFullstack(branch);
      break;
  }
  logInfo(`Current stack is valid`);
}

function validateBranchFullstack(branch: Branch): void {
  const metaStack = new MetaStackBuilder().fullStackFromBranch(branch);
  const gitStack = new GitStackBuilder().fullStackFromBranch(branch);

  compareStacks(metaStack, gitStack);
}

function validateBranchDownstackInclusive(branch: Branch): void {
  const metaStack = new MetaStackBuilder().downstackFromBranch(branch);
  const gitStack = new GitStackBuilder().downstackFromBranch(branch);

  compareStacks(metaStack, gitStack);
}

function validateBranchUpstackInclusive(branch: Branch): void {
  const metaStack =
    new MetaStackBuilder().upstackInclusiveFromBranchWithParents(branch);
  const gitStack = new GitStackBuilder().upstackInclusiveFromBranchWithParents(
    branch
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
