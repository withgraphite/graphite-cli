import {
  CURRENT_REPO_CONFIG_PATH,
  trunkBranches,
} from "../actions/repo_config";
import { validate } from "../actions/validate";
import PrintStacksCommand from "../commands/original-commands/print-stacks";
import {
  PreconditionsFailedError,
  RebaseConflictError,
  ValidationFailedError,
} from "../lib/errors";
import { log } from "../lib/log";
import { currentBranchPrecondition } from "../lib/preconditions";
import {
  checkoutBranch,
  gpExecSync,
  rebaseInProgress,
  uncommittedChanges,
} from "../lib/utils";
import Branch from "../wrapper-classes/branch";
import { restackBranch } from "./fix";
export async function ontoAction(onto: string, silent: boolean): Promise<void> {
  if (uncommittedChanges()) {
    throw new PreconditionsFailedError("Cannot fix with uncommitted changes");
  }
  // Print state before
  log(`Before fix:`, { silent });
  !silent && (await new PrintStacksCommand().executeUnprofiled({ silent }));

  const originalBranch = currentBranchPrecondition();

  await restackOnto(originalBranch, onto, silent);

  checkoutBranch(originalBranch.name);

  // Print state after
  log(`After fix:`, { silent });
  !silent && (await new PrintStacksCommand().executeUnprofiled({ silent }));
}

async function restackOnto(
  currentBranch: Branch,
  onto: string,
  silent: boolean
) {
  if (!Branch.exists(onto)) {
    throw new PreconditionsFailedError(
      `Branch named "${onto}" does not exist in the current repo`
    );
  }
  // Check that the current branch has a parent to prevent moving main
  checkBranchCanBeMoved(currentBranch, onto);
  await validateStack(silent);
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
      }
    }
  );
  // set current branch's parent only if the rebase succeeds.
  currentBranch.setParentBranchName(onto);
  // Now perform a fix starting from the onto branch:
  for (const child of await currentBranch.getChildrenFromMeta()) {
    await restackBranch(child, silent);
  }
}
async function validateStack(silent: boolean) {
  try {
    await validate("UPSTACK", silent);
  } catch {
    throw new ValidationFailedError(
      `Cannot stack "onto", git branches must match stack. Consider running "fix" or "regen" first.`
    );
  }
}

function checkBranchCanBeMoved(branch: Branch, onto: string) {
  if (trunkBranches && branch.name in trunkBranches) {
    throw new PreconditionsFailedError(
      `Cannot stack (${branch.name}) onto ${onto}, (${branch.name}) is listed in (${CURRENT_REPO_CONFIG_PATH}) as a trunk branch.`
    );
  }
}

async function getParentForRebaseOnto(
  branch: Branch,
  onto: string
): Promise<Branch> {
  const metaParent = branch.getParentFromMeta();
  if (metaParent) {
    return metaParent;
  }
  // If no meta parent, automatically recover:
  branch.setParentBranchName(onto);
  return new Branch(onto);
}
