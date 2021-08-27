import chalk from "chalk";
import prompts from "prompts";
import { cache } from "../lib/config";
import {
  ExitCancelledError,
  ExitFailedError,
  RebaseConflictError,
} from "../lib/errors";
import {
  currentBranchPrecondition,
  uncommittedChangesPrecondition,
} from "../lib/preconditions";
import {
  checkoutBranch,
  gpExecSync,
  logInfo,
  rebaseInProgress,
} from "../lib/utils";
import { getTrunk } from "../lib/utils/trunk";
import {
  Branch,
  GitStackBuilder,
  MetaStackBuilder,
  Stack,
  StackNode,
} from "../wrapper-classes";

async function promptStacks(opts: {
  gitStack: Stack;
  metaStack: Stack;
}): Promise<"regen" | "rebase"> {
  const response = await prompts({
    type: "select",
    name: "value",
    message: `Rebase branches or regerate stacks metadata?`,
    choices: ["rebase", "regen"].map((r) => {
      return {
        title:
          r === "rebase"
            ? `rebase branches, using Graphite stacks as truth (${chalk.green(
                "common choice"
              )})\n` +
              opts.metaStack
                .toString()
                .split("\n")
                .map((l) => "    " + l)
                .join("\n") +
              "\n"
            : `regen stack metadata, using Git commit tree as truth\n` +
              opts.gitStack
                .toString()
                .split("\n")
                .map((l) => "    " + l)
                .join("\n") +
              "\n",
        value: r,
      };
    }),
  });

  if (!response.value) {
    throw new ExitCancelledError("No changes made");
  }

  return response.value;
}

export async function fixAction(opts: {
  action: "regen" | "rebase" | undefined;
}): Promise<void> {
  const currentBranch = currentBranchPrecondition();
  uncommittedChangesPrecondition();

  const metaStack = new MetaStackBuilder().fullStackFromBranch(currentBranch);
  const gitStack = new GitStackBuilder().fullStackFromBranch(currentBranch);

  // Consider noop
  if (metaStack.equals(gitStack)) {
    logInfo(`No fix needed`);
    return;
  }

  const action = opts.action || (await promptStacks({ gitStack, metaStack }));

  if (action === "regen") {
    await regen(currentBranch);
  } else {
    for (const child of metaStack.source.children) {
      await restackNode(child);
    }
  }
  checkoutBranch(currentBranch.name);
}

export async function restackBranch(branch: Branch): Promise<void> {
  const metaStack =
    new MetaStackBuilder().upstackInclusiveFromBranchWithParents(branch);
  await restackNode(metaStack.source);
}

async function restackNode(node: StackNode): Promise<void> {
  if (rebaseInProgress()) {
    throw new RebaseConflictError(
      `Interactive rebase in progress, cannot fix (${node.branch.name}). Complete the rebase and re-run fix command.`
    );
  }
  const parentBranch = node.parent?.branch;
  if (!parentBranch) {
    throw new ExitFailedError(
      `Cannot find parent in stack for (${node.branch.name}), stopping fix`
    );
  }
  const mergeBase = node.branch.getMetaMergeBase();
  if (!mergeBase) {
    throw new ExitFailedError(
      `Cannot find a merge base in the stack for (${node.branch.name}), stopping fix`
    );
  }

  if (parentBranch.ref() === mergeBase) {
    logInfo(
      `No fix needed for (${node.branch.name}) on (${parentBranch.name})`
    );
  } else {
    logInfo(
      `Fixing (${chalk.green(node.branch.name)}) on (${parentBranch.name})`
    );
    checkoutBranch(node.branch.name);
    node.branch.setMetaPrevRef(node.branch.getCurrentRef());
    gpExecSync(
      {
        command: `git rebase --onto ${parentBranch.name} ${mergeBase} ${node.branch.name}`,
        options: { stdio: "ignore" },
      },
      () => {
        if (rebaseInProgress()) {
          throw new RebaseConflictError(
            "Resolve the conflict (via `git rebase --continue`) and then rerun `gt stack fix` to fix the remaining stack."
          );
        }
      }
    );
    cache.clearAll();
  }

  for (const child of node.children) {
    await restackNode(child);
  }
}

async function regen(branch: Branch): Promise<void> {
  const trunk = getTrunk();
  if (trunk.name == branch.name) {
    regenAllStacks();
    return;
  }

  const gitStack = new GitStackBuilder().fullStackFromBranch(branch);
  await recursiveRegen(gitStack.source);
}

function regenAllStacks(): void {
  const allGitStacks = new GitStackBuilder().allStacks();
  logInfo(`Computing regenerating ${allGitStacks.length} stacks...`);
  allGitStacks.forEach((stack) => {
    logInfo(`\nRegenerating:\n${stack.toString()}`);
    recursiveRegen(stack.source);
  });
}

function recursiveRegen(node: StackNode) {
  // The only time we expect newParent to be undefined is if we're fixing
  // the base branch which is behind trunk.
  const branch = node.branch;

  // Set parents if not trunk
  if (branch.name !== getTrunk().name) {
    const oldParent = branch.getParentFromMeta();
    const newParent = node.parent?.branch || getTrunk();
    if (oldParent && oldParent.name === newParent.name) {
      logInfo(
        `-> No change for (${branch.name}) with branch parent (${oldParent.name})`
      );
    } else {
      logInfo(
        `-> Updating (${branch.name}) branch parent from (${
          oldParent?.name
        }) to (${chalk.green(newParent.name)})`
      );
      branch.setParentBranchName(newParent.name);
    }
  }

  node.children.forEach(recursiveRegen);
}
