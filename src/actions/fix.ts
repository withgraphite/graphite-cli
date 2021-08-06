import chalk from "chalk";
import prompts from "prompts";
import { regenAction } from "../actions/regen";
import {
  ExitFailedError,
  PreconditionsFailedError,
  RebaseConflictError,
} from "../lib/errors";
import { currentBranchPrecondition } from "../lib/preconditions";
import {
  checkoutBranch,
  gpExecSync,
  logInfo,
  rebaseInProgress,
  uncommittedChanges,
} from "../lib/utils";
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

  const metaStack = new MetaStackBuilder().fullStackFromBranch(currentBranch);
  const gitStack = new GitStackBuilder().fullStackFromBranch(currentBranch);

  if (metaStack.equals(gitStack)) {
    logInfo(`No fix needed`);
    return;
  }

  if (uncommittedChanges()) {
    throw new PreconditionsFailedError("Cannot fix with uncommitted changes");
  }

  const action = opts.action || (await promptStacks({ gitStack, metaStack }));

  if (action === "regen") {
    await regenAction(opts.silent);
  } else {
    console.log(`restacking ${metaStack.toString()}`);
    for (const child of metaStack.source.children) {
      console.log(`restacking child ${child.branch.name}`);
      await restackNode(child, opts.silent);
    }
  }
  checkoutBranch(currentBranch.name);
}

export async function restackBranch(
  branch: Branch,
  silent: boolean
): Promise<void> {
  const metaStack = new MetaStackBuilder().upstackInclusiveFromBranch(branch);
  console.log(`restacking child ${branch.name}`);
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
