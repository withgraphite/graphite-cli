import { validate } from '../actions/validate';
import { cache } from '../lib/config';
import {
  MergeConflictCallstackT,
  StackOntoBaseRebaseStackFrameT,
  StackOntoFixStackFrameT,
} from '../lib/config/merge_conflict_callstack_config';
import {
  ExitFailedError,
  PreconditionsFailedError,
  RebaseConflictError,
  ValidationFailedError,
} from '../lib/errors';
import {
  branchExistsPrecondition,
  currentBranchPrecondition,
} from '../lib/preconditions';
import {
  checkoutBranch,
  getTrunk,
  gpExecSync,
  logInfo,
  rebaseInProgress,
  uncommittedChanges,
} from '../lib/utils';
import Branch from '../wrapper-classes/branch';
import { restackBranch } from './fix';
export async function ontoAction(args: {
  onto: string;
  mergeConflictCallstack: MergeConflictCallstackT;
}): Promise<void> {
  if (uncommittedChanges()) {
    throw new PreconditionsFailedError('Cannot fix with uncommitted changes');
  }

  const originalBranch = currentBranchPrecondition();

  await stackOnto(originalBranch, args.onto, args.mergeConflictCallstack);

  checkoutBranch(originalBranch.name);
}

async function stackOnto(
  currentBranch: Branch,
  onto: string,
  mergeConflictCallstack: MergeConflictCallstackT
) {
  branchExistsPrecondition(onto);
  checkBranchCanBeMoved(currentBranch, onto);
  validateStack();
  const parent = await getParentForRebaseOnto(currentBranch, onto);
  // Save the old ref from before rebasing so that children can find their bases.
  currentBranch.setMetaPrevRef(currentBranch.getCurrentRef());

  const stackOntoContinuationFrame = {
    op: 'STACK_ONTO_BASE_REBASE_CONTINUATION' as const,
    currentBranchName: currentBranch.name,
    onto: onto,
  };

  // Add try catch check for rebase interactive....
  gpExecSync(
    {
      command: `git rebase --onto ${onto} $(git merge-base ${currentBranch.name} ${parent.name}) ${currentBranch.name}`,
      options: { stdio: 'ignore' },
    },
    (err) => {
      if (rebaseInProgress()) {
        throw new RebaseConflictError(
          `Interactive rebase in progress, cannot fix (${currentBranch.name}) onto (${onto}).`,
          {
            frame: stackOntoContinuationFrame,
            parent: mergeConflictCallstack,
          }
        );
      } else {
        throw new ExitFailedError(
          `Rebase failed when moving (${currentBranch.name}) onto (${onto}).`,
          err
        );
      }
    }
  );

  await stackOntoBaseRebaseContinuation(
    stackOntoContinuationFrame,
    mergeConflictCallstack
  );
}

export async function stackOntoBaseRebaseContinuation(
  frame: StackOntoBaseRebaseStackFrameT,
  mergeConflictCallstack: MergeConflictCallstackT
): Promise<void> {
  const currentBranch = await Branch.branchWithName(frame.currentBranchName);
  const onto = frame.onto;

  cache.clearAll();
  // set current branch's parent only if the rebase succeeds.
  console.log(`setting ${currentBranch.name} parent to ${onto}`);
  currentBranch.setParentBranchName(onto);

  // Now perform a fix starting from the onto branch:
  const stackOntoContinuationFrame = {
    op: 'STACK_ONTO_FIX_CONTINUATION' as const,
    currentBranchName: frame.currentBranchName,
    onto: frame.onto,
  };

  await restackBranch({
    branch: currentBranch,
    mergeConflictCallstack: {
      frame: stackOntoContinuationFrame,
      parent: mergeConflictCallstack,
    },
  });

  await stackOntoFixContinuation(stackOntoContinuationFrame);
}

export async function stackOntoFixContinuation(
  frame: StackOntoFixStackFrameT
): Promise<void> {
  logInfo(
    `Successfully moved (${frame.currentBranchName}) onto (${frame.onto})`
  );
}

function getParentForRebaseOnto(branch: Branch, onto: string): Branch {
  const metaParent = branch.getParentFromMeta();
  if (metaParent) {
    return metaParent;
  }
  // If no meta parent, automatically recover:
  branch.setParentBranchName(onto);
  return new Branch(onto);
}

function validateStack() {
  try {
    validate('UPSTACK');
  } catch {
    throw new ValidationFailedError(
      `Cannot stack "onto", git branches must match stack.`
    );
  }
}

function checkBranchCanBeMoved(branch: Branch, onto: string) {
  if (branch.name === getTrunk().name) {
    throw new PreconditionsFailedError(
      `Cannot stack (${branch.name}) onto ${onto}, (${branch.name}) is currently set as trunk.`
    );
  }
}
