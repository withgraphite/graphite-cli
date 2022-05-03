import { TContext } from '../lib/context/context';
import { ValidationFailedError } from '../lib/errors';
import { currentBranchPrecondition } from '../lib/preconditions';
import { logDebug, logInfo } from '../lib/utils';
import { GitStackBuilder, MetaStackBuilder, Stack } from '../wrapper-classes';
import { Branch } from '../wrapper-classes/branch';
import { TScope } from './scope';

export function validate(scope: TScope, context: TContext): Branch[] {
  const { metaStack, gitStack } = getStacksForValidation(scope, context);
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

  logInfo(`Current stack is valid`);
  return metaStack.branches().filter((b) => !b.isTrunk(context));
}

export function getStacksForValidation(
  scope: TScope,
  context: TContext
): { metaStack: Stack; gitStack: Stack } {
  const currentBranch = currentBranchPrecondition(context);

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
