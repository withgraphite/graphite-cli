import { cache } from '../../lib/config/cache';
import {
  TMergeConflictCallstack,
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
import { Branch } from '../../wrapper-classes/branch';
import { restackBranch } from '../fix';
import { validate } from '../validate';

export function stackOnto(
  opts: {
    currentBranch: Branch;
    onto: string;
    mergeConflictCallstack: TMergeConflictCallstack;
  },
  context: TContext
): void {
  branchExistsPrecondition(opts.onto);
  checkBranchCanBeMoved(opts.currentBranch, opts.onto, context);
  validateStack(context);
  const parent = getParentForRebaseOnto(opts.currentBranch, opts.onto, context);
  // Save the old ref from before rebasing so that children can find their bases.
  opts.currentBranch.savePrevRef();

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
          [stackOntoContinuationFrame, ...opts.mergeConflictCallstack],
          context
        );
      } else {
        throw new ExitFailedError(
          `Rebase failed when moving (${opts.currentBranch.name}) onto (${opts.onto}).`,
          err
        );
      }
    }
  );

  stackOntoBaseRebaseContinuation(
    stackOntoContinuationFrame,
    opts.mergeConflictCallstack,
    context
  );
}

export function stackOntoBaseRebaseContinuation(
  frame: TStackOntoBaseRebaseStackFrame,
  mergeConflictCallstack: TMergeConflictCallstack,
  context: TContext
): void {
  const currentBranch = Branch.branchWithName(frame.currentBranchName, context);
  const onto = frame.onto;

  cache.clearAll();
  // set current branch's parent only if the rebase succeeds.
  logInfo(`Setting parent of ${currentBranch.name} parent to ${onto}.`);
  currentBranch.setParentBranch(new Branch(onto));

  // Now perform a fix starting from the onto branch:
  const stackOntoContinuationFrame = {
    op: 'STACK_ONTO_FIX_CONTINUATION' as const,
    currentBranchName: frame.currentBranchName,
    onto: frame.onto,
  };

  restackBranch(
    {
      branch: currentBranch,
      mergeConflictCallstack: [
        stackOntoContinuationFrame,
        ...mergeConflictCallstack,
      ],
    },
    context
  );

  stackOntoFixContinuation(stackOntoContinuationFrame);
}

export function stackOntoFixContinuation(frame: TStackOntoFixStackFrame): void {
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
