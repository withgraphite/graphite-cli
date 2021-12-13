import { ValidationFailedError } from '../lib/errors';
import { currentBranchPrecondition } from '../lib/preconditions';
import { logInfo } from '../lib/utils';
import { GitStackBuilder, MetaStackBuilder, Stack } from '../wrapper-classes';
import Branch from '../wrapper-classes/branch';
import { TScope } from './scope';
import { TSubmitScope } from './submit/submit';

export function validateSubmit(scope: TSubmitScope): void {
  const branch = currentBranchPrecondition();
  if (scope === 'BRANCH') {
    validateBranchforSubmit(branch);
  } else {
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

function validateBranchforSubmit(branch: Branch): void {
  const branchState = branch.getPRInfo()?.state;
  if (branchState === 'MERGED' || branchState === 'CLOSED') {
    throw new ValidationFailedError(
      `${branch.name} has been ${branchState}. This will affect submit functionality. Please fix.`
    );
    // TODO (nehasri): Add tip to suggest that they can delete branch and restack, or rebase or open the PR if close.
  }

  logInfo(`Current branch is in valid state to submit a PR.`);
}

function validateBranchFullstack(branch: Branch): void {
  const metaStack = new MetaStackBuilder().fullStackFromBranch(branch);
  const gitStack = new GitStackBuilder().fullStackFromBranch(branch);

  compareStacks(metaStack, gitStack);
}

function validateBranchDownstackInclusive(branch: Branch): void {
  const metaStack =
    new MetaStackBuilder().upstackInclusiveFromBranchWithParents(branch);
  const gitStack = new GitStackBuilder().upstackInclusiveFromBranchWithParents(
    branch
  );

  metaStack.source.children = [];
  gitStack.source.children = [];

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
