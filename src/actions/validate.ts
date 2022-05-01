import { TContext } from '../lib/context/context';
import { ValidationFailedError } from '../lib/errors';
import { currentBranchPrecondition } from '../lib/preconditions';
import { logInfo } from '../lib/utils';
import { GitStackBuilder, MetaStackBuilder, Stack } from '../wrapper-classes';
import { Branch } from '../wrapper-classes/branch';
import { TScope } from './scope';

export function validate(scope: TScope, context: TContext): Branch[] {
  const currentBranch = currentBranchPrecondition(context);
  const gitStack = new GitStackBuilder().getStack(
    { currentBranch, scope },
    context
  );
  const metaStack = new MetaStackBuilder().getStack(
    { currentBranch, scope },
    context
  );
  compareStacks(metaStack, gitStack);

  logInfo(`Current stack is valid`);
  return metaStack.branches().filter((b) => !b.isTrunk(context));
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
