import { cache } from '../../lib/config';
import {
  MergeConflictCallstackT,
  TStackOntoBaseRebaseStackFrame,
  TStackOntoFixStackFrame,
} from '../../lib/config/merge_conflict_callstack_config';
import { TContext } from '../../lib/context/context';
import {
  ExitFailedError,
  PreconditionsFailedError,
  RebaseConflictError,
  ValidationFailedError,
} from '../../lib/errors';
import { branchExistsPrecondition } from '../../lib/preconditions';
import {
  getTrunk,
  gpExecSync,
  logInfo,
  rebaseInProgress,
} from '../../lib/utils';
import Branch from '../../wrapper-classes/branch';
import { restackBranch } from '../fix';
import { validate } from '../validate';

export async function stackOnto(
  opts: {
    currentBranch: Branch;
    onto: string;
    mergeConflictCallstack: MergeConflictCallstackT;
  },
  context: TContext
): Promise<void> {
  branchExistsPrecondition(opts.onto);
  checkBranchCanBeMoved(opts.currentBranch, opts.onto, context);
  validateStack(context);
  const parent = await getParentForRebaseOnto(
    opts.currentBranch,
    opts.onto,
    context
  );
  // Save the old ref from before rebasing so that children can find their bases.
  opts.currentBranch.setMetaPrevRef(opts.currentBranch.getCurrentRef());

  const stackOntoContinuationFrame = {
    op: 'STACK_ONTO_BASE_REBASE_CONTINUATION' as const,
    currentBranchName: opts.currentBranch.name,
    onto: opts.onto,
  };

  // Add try catch check for rebase interactive....
  gpExecSync(
    {
      command: `git rebase --onto ${opts.onto} $(git merge-base ${opts.currentBranch.name} ${parent.name}) ${opts.currentBranch.name}`,
      options: { stdio: 'ignore' },
    },
    (err) => {
      if (rebaseInProgress()) {
        throw new RebaseConflictError(
          `Interactive rebase in progress, cannot fix (${opts.currentBranch.name}) onto (${opts.onto}).`,
          {
            frame: stackOntoContinuationFrame,
            parent: opts.mergeConflictCallstack,
          }
        );
      } else {
        throw new ExitFailedError(
          `Rebase failed when moving (${opts.currentBranch.name}) onto (${opts.onto}).`,
          err
        );
      }
    }
  );

  await stackOntoBaseRebaseContinuation(
    stackOntoContinuationFrame,
    opts.mergeConflictCallstack,
    context
  );
}

export async function stackOntoBaseRebaseContinuation(
  frame: TStackOntoBaseRebaseStackFrame,
  mergeConflictCallstack: MergeConflictCallstackT,
  context: TContext
): Promise<void> {
  const currentBranch = await Branch.branchWithName(
    frame.currentBranchName,
    context
  );
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

  await restackBranch(
    {
      branch: currentBranch,
      mergeConflictCallstack: {
        frame: stackOntoContinuationFrame,
        parent: mergeConflictCallstack,
      },
    },
    context
  );

  await stackOntoFixContinuation(stackOntoContinuationFrame);
}

export async function stackOntoFixContinuation(
  frame: TStackOntoFixStackFrame
): Promise<void> {
  logInfo(
    `Successfully moved (${frame.currentBranchName}) onto (${frame.onto})`
  );
}

function getParentForRebaseOnto(
  branch: Branch,
  onto: string,
  context: TContext
): Branch {
  const metaParent = branch.getParentFromMeta(context);
  if (metaParent) {
    return metaParent;
  }
  // If no meta parent, automatically recover:
  branch.setParentBranchName(onto);
  return new Branch(onto);
}

function validateStack(context: TContext) {
  try {
    validate('UPSTACK', context);
  } catch {
    throw new ValidationFailedError(
      `Cannot stack "onto", git branches must match stack.`
    );
  }
}

function checkBranchCanBeMoved(
  branch: Branch,
  onto: string,
  context: TContext
) {
  if (branch.name === getTrunk(context).name) {
    throw new PreconditionsFailedError(
      `Cannot stack (${branch.name}) onto ${onto}, (${branch.name}) is currently set as trunk.`
    );
  }
}
