import chalk from "chalk";
import prompts from "prompts";
import { ExitFailedError, RebaseConflictError } from "../lib/errors";
import { log } from "../lib/log";
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
  stackNodeT,
} from "../wrapper-classes";

async function promptStacks(opts: {
  gitStack: Stack;
  metaStack: Stack;
}): Promise<"regen" | "rebase"> {
  const response = await prompts({
    type: "select",
    name: "value",
    message: `Pick a source of truth for stacks`,
    choices: ["rebase", "regen"].map((r) => {
      return {
        title:
          r === "rebase"
            ? "Graphite stacks\n" +
              opts.metaStack
                .toString()
                .split("\n")
                .map((l) => "    " + l)
                .join("\n") +
              "\n"
            : "Git commit tree\n" +
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

  return response.value;
}

export async function fixAction(opts: {
  action: "regen" | "rebase" | undefined;
  silent: boolean;
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
      await restackNode(child, opts.silent);
    }
  }
  checkoutBranch(currentBranch.name);
}

export async function restackBranch(
  branch: Branch,
  silent: boolean
): Promise<void> {
  const metaStack =
    new MetaStackBuilder().upstackInclusiveFromBranchWithParents(branch);
  await restackNode(metaStack.source, silent);
}

async function restackNode(node: stackNodeT, silent: boolean): Promise<void> {
  if (rebaseInProgress()) {
    throw new RebaseConflictError(
      `Interactive rebase in progress, cannot fix (${node.branch.name}). Complete the rebase and re-run fix command.`
    );
  }
  const parentBranch = node.parents[0].branch;
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
            "Resolve the conflict (via `git rebase --continue`) and then rerun `gp stack fix` to fix the remaining stack."
          );
        }
      }
    );
  }

  for (const child of node.children) {
    await restackNode(child, silent);
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
  const allGitStacks = new GitStackBuilder().allStacksFromTrunk();
  log(`Computing regenerating ${allGitStacks.length} stacks...`);
  allGitStacks.forEach((stack) => {
    log(`\nRegenerating:\n${stack.toString()}`);
    recursiveRegen(stack.source);
  });
}

function recursiveRegen(node: stackNodeT) {
  // The only time we expect newParent to be undefined is if we're fixing
  // the base branch which is behind trunk.
  const branch = node.branch;

  // Set parents if not trunk
  if (branch.name !== getTrunk().name) {
    const oldParent = branch.getParentFromMeta();
    const newParent = node.parents[0]?.branch; // TODO: Deal with regen if there are multi parents
    if (!newParent) {
      throw new ExitFailedError(`Fresh meta stack shouldnt have empty parent`);
    }
    if (oldParent && oldParent.name === newParent.name) {
      log(
        `-> No change for (${branch.name}) with branch parent (${oldParent.name})`,
        { silent: false }
      );
    } else {
      log(
        `-> Updating (${branch.name}) branch parent from (${
          oldParent?.name
        }) to (${chalk.green(newParent.name)})`,
        { silent: false }
      );
      branch.setParentBranchName(newParent.name);
    }
  }

  node.children.forEach(recursiveRegen);
}
