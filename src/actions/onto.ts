import { validate } from "../actions/validate";
import {
  ExitFailedError,
  PreconditionsFailedError,
  RebaseConflictError,
  ValidationFailedError,
} from "../lib/errors";
import {
  branchExistsPrecondition,
  currentBranchPrecondition,
} from "../lib/preconditions";
import {
  checkoutBranch,
  getTrunk,
  gpExecSync,
  logInfo,
  rebaseInProgress,
  uncommittedChanges,
} from "../lib/utils";
import Branch from "../wrapper-classes/branch";
import { restackBranch } from "./fix";
export async function ontoAction(onto: string): Promise<void> {
  if (uncommittedChanges()) {
    throw new PreconditionsFailedError("Cannot fix with uncommitted changes");
  }

  const originalBranch = currentBranchPrecondition();

  await stackOnto(originalBranch, onto);

  checkoutBranch(originalBranch.name);
}

async function stackOnto(currentBranch: Branch, onto: string) {
  branchExistsPrecondition(onto);
  checkBranchCanBeMoved(currentBranch, onto);
  await validateStack();
  const parent = await getParentForRebaseOnto(currentBranch, onto);
  // Save the old ref from before rebasing so that children can find their bases.
  currentBranch.setMetaPrevRef(currentBranch.getCurrentRef());

  // Add try catch check for rebase interactive....
  gpExecSync(
    {
      command: `git rebase --onto ${onto} $(git merge-base ${currentBranch.name} ${parent.name}) ${currentBranch.name}`,
      options: { stdio: "ignore" },
    },
    () => {
      if (rebaseInProgress()) {
        throw new RebaseConflictError(
          "Please resolve the rebase conflict and then continue with your `stack onto` command."
        );
      } else {
        throw new ExitFailedError(
          `Rebase failed when moving (${currentBranch.name}) onto (${onto}).`
        );
      }
    }
  );
  // set current branch's parent only if the rebase succeeds.
  console.log(`setting ${currentBranch.name} parent to ${onto}`);
  currentBranch.setParentBranchName(onto);

  // Now perform a fix starting from the onto branch:
  await restackBranch(currentBranch);
  logInfo(`Successfully moved (${currentBranch.name}) onto (${onto})`);
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

async function validateStack() {
  try {
    await validate("UPSTACK");
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
