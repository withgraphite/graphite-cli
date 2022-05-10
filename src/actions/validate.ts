import { TContext } from '../lib/context';
import { ValidationFailedError } from '../lib/errors';
import { currentBranchPrecondition } from '../lib/preconditions';
import { logDebug } from '../lib/utils/splog';
import { Branch } from '../wrapper-classes/branch';
import { GitStackBuilder } from '../wrapper-classes/git_stack_builder';
import { MetaStackBuilder } from '../wrapper-classes/meta_stack_builder';
import { Stack } from '../wrapper-classes/stack';
import { TScope } from './scope';

export function validate(scope: TScope, context: TContext): Branch[] {
  const currentBranch = currentBranchPrecondition();

  const { metaStack, gitStack } = getStacksForValidation(
    currentBranch,
    scope,
    context
  );

  if (!metaStack.equals(gitStack)) {
    throw new ValidationFailedError(metaStack, gitStack, currentBranch);
  }

  // Stacks are valid, we can update parentRevision
  // TODO: Remove after migrating validation to parentRevision
  backfillParentShasOnValidatedStack(metaStack, context);

  logDebug(`Current stack is valid`);
  return metaStack
    .branches()
    .filter((b) => !b.isTrunk(context))
    .map((b) => new Branch(b.name));
}

function backfillParentShasOnValidatedStack(
  stack: Stack,
  context: TContext
): void {
  stack
    .branches()
    .map((b) => b.name)
    .forEach((branchName) => {
      const branch = Branch.branchWithName(branchName);
      const parentBranch = branch.getParentFromMeta(context);
      if (
        parentBranch &&
        branch.getParentBranchSha() !== parentBranch.getCurrentRef()
      ) {
        logDebug(`Updating parent revision of ${branch}`);
        branch.setParentBranch(parentBranch);
      }
    });
}

function getStacksForValidation(
  currentBranch: Branch,
  scope: TScope,
  context: TContext
): { metaStack: Stack; gitStack: Stack } {
  logDebug(`Determining meta ${scope} from ${currentBranch.name}`);
  const metaStack = new MetaStackBuilder({ useMemoizedResults: true }).getStack(
    { currentBranch, scope },
    context
  );
  logDebug(`Found meta ${scope}.`);
  logDebug(metaStack.toString());

  logDebug(`Determining full git ${scope} from ${currentBranch.name}`);
  const gitStack = new GitStackBuilder({ useMemoizedResults: true }).getStack(
    { currentBranch, scope },
    context
  );
  logDebug(`Found full git ${scope}`);
  logDebug(gitStack.toString());

  return {
    metaStack,
    gitStack,
  };
}
