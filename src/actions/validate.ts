import { ValidationFailedError } from '../lib/errors';
import { currentBranchPrecondition } from '../lib/preconditions';
import { logInfo } from '../lib/utils';
import { GitStackBuilder, MetaStackBuilder, Stack } from '../wrapper-classes';
import Branch from '../wrapper-classes/branch';
import { TScope } from './scope';
<<<<<<< HEAD
<<<<<<< HEAD
import { TSubmitScope } from './submit/submit';
=======
import { TSubmitScope } from './submit/submit';

export function validateStack(scope: TSubmitScope, stack: Stack): void {
  const branch = currentBranchPrecondition();
  let gitStack;
  switch (scope) {
    case 'FULLSTACK':
      gitStack = new GitStackBuilder().fullStackFromBranch(branch);
      compareStacks(stack, gitStack);
      break;
    case 'UPSTACK':
      gitStack = new GitStackBuilder().upstackInclusiveFromBranchWithParents(
        branch
      );
      stack.source.parent = undefined;
      gitStack.source.parent = undefined;
      compareStacks(stack, gitStack);
      break;
    case 'DOWNSTACK':
      gitStack = new GitStackBuilder().downstackFromBranch(branch);
      stack.source.children = [];
      gitStack.source.children = [];
      compareStacks(stack, gitStack);
      break;
  }
  logInfo(`Validation for current stack: passed`);
}
>>>>>>> 4549c4c (fix(validate): validate submitted stack)

export function validateStack(scope: TSubmitScope, stack: Stack): void {
  const branch = currentBranchPrecondition();
<<<<<<< HEAD
  let gitStack;
  switch (scope) {
    case 'FULLSTACK':
      gitStack = new GitStackBuilder().fullStackFromBranch(branch);
      compareStacks(stack, gitStack);
      break;
    case 'UPSTACK':
      gitStack = new GitStackBuilder().upstackInclusiveFromBranchWithParents(
        branch
      );
      stack.source.parent = undefined;
      gitStack.source.parent = undefined;
      compareStacks(stack, gitStack);
      break;
    case 'DOWNSTACK':
      gitStack = new GitStackBuilder().downstackFromBranch(branch);
      stack.source.children = [];
      gitStack.source.children = [];
      compareStacks(stack, gitStack);
      break;
  }
  logInfo(`Validation for current stack: passed`);
}
=======
>>>>>>> 786e277 (fix(submit): undo validate changes)

export function validate(scope: TScope): void {
  const branch = currentBranchPrecondition();
=======
>>>>>>> 9d28226 (fix(validate): add tests to validateStack)
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
