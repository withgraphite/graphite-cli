import { TContext } from '../lib/context';
import { ValidationFailedError } from '../lib/errors';
import { getBranchRevision } from '../lib/git/get_branch_revision';
import { currentBranchPrecondition } from '../lib/preconditions';
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

  context.splog.logDebug(`Current stack is valid`);
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
        branch.getParentBranchSha() !== getBranchRevision(parentBranch.name)
      ) {
        context.splog.logDebug(`Updating parent revision of ${branch}`);
        branch.setParentBranch(parentBranch.name);
      }
    });
}

function getStacksForValidation(
  currentBranch: Branch,
  scope: TScope,
  context: TContext
): { metaStack: Stack; gitStack: Stack } {
  context.splog.logDebug(
    `Determining meta ${scope} from ${currentBranch.name}`
  );
  const metaStack = new MetaStackBuilder({ useMemoizedResults: true }).getStack(
    { currentBranch, scope },
    context
  );
  context.splog.logDebug(`Found meta ${scope}.`);
  context.splog.logDebug(metaStack.toString());

  context.splog.logDebug(
    `Determining full git ${scope} from ${currentBranch.name}`
  );
  const gitStack = new GitStackBuilder({ useMemoizedResults: true }).getStack(
    { currentBranch, scope },
    context
  );
  context.splog.logDebug(`Found full git ${scope}`);
  context.splog.logDebug(gitStack.toString());

  return {
    metaStack,
    gitStack,
  };
}
