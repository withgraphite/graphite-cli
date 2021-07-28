import chalk from "chalk";
import { validate } from "../actions/validate";
import PrintStacksCommand from "../commands/original-commands/print-stacks";
import { log } from "../lib/log";
import {
  checkoutBranch,
  CURRENT_REPO_CONFIG_PATH,
  gpExecSync,
  logErrorAndExit,
  rebaseInProgress,
  trunkBranches,
  uncommittedChanges,
} from "../lib/utils";
import Branch from "../wrapper-classes/branch";
import { restackBranch } from "./fix";
export async function ontoAction(onto: string, silent: boolean): Promise<void> {
  if (uncommittedChanges()) {
    logErrorAndExit("Cannot fix with uncommitted changes");
  }
  // Print state before
  log(`Before fix:`, { silent });
  !silent && (await new PrintStacksCommand().executeUnprofiled({ silent }));

  const originalBranch = Branch.getCurrentBranch();
  if (originalBranch === null) {
    logErrorAndExit(`Not currently on a branch; no target to fix.`);
  }

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
  // Check that the current branch has a parent to prevent moving main
  checkBranchCanBeMoved(currentBranch, onto, silent);
  await validateStack(silent);
  const parent = getParentForRebaseOnto(currentBranch, silent);
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
        log(
          chalk.yellow(
            "Please resolve the rebase conflict and then continue with your `stack onto` command."
          )
        );
        process.exit(0);
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
    log(
      chalk.red(
        `Cannot move stack "onto", git branches must match stack. Consider running "fix" or "regen" first.`
      ),
      { silent }
    );
    process.exit(1);
  }
}

function checkBranchCanBeMoved(branch: Branch, onto: string, silent: boolean) {
  if (trunkBranches && branch.name in trunkBranches) {
    log(
      chalk.red(
        `Cannot fix (${branch.name}) onto ${onto}, (${branch.name}) is listed in (${CURRENT_REPO_CONFIG_PATH}) as a trunk branch.`
      ),
      { silent }
    );
    process.exit(1);
  }
}

function getParentForRebaseOnto(branch: Branch, silent: boolean): Branch {
  const parent = branch.getParentFromMeta();
  if (!parent) {
    log(
      chalk.red(
        `Cannot "fix --onto", (${branch.name}) has no branch parent in the stack.`
      ),
      { silent }
    );
    process.exit(1);
  }
  return parent;
}
