#!/usr/bin/env node
import chalk from "chalk";
import { execSync } from "child_process";
import prompts from "prompts";
import { ExitFailedError } from "../lib/errors";
import { currentBranchPrecondition } from "../lib/preconditions";
import { logInfo } from "../lib/utils";
import Branch from "../wrapper-classes/branch";

function getPrevBranch(currentBranch: Branch): string | undefined {
  const branch = currentBranch.getParentFromMeta();
  return branch?.name;
}

async function getNextBranch(
  currentBranch: Branch,
  interactive: boolean
): Promise<string | undefined> {
  const candidates = currentBranch.getChildrenFromMeta();

  if (candidates.length === 0) {
    return;
  }
  if (candidates.length > 1) {
    if (interactive) {
      return (
        await prompts({
          type: "select",
          name: "branch",
          message: "Select a branch to checkout",
          choices: candidates.map((b) => {
            return { title: b.name, value: b.name };
          }),
        })
      ).branch;
    } else {
      throw new ExitFailedError(
        `Cannot get next branch, multiple choices available: [${candidates.join(
          ", "
        )}]`
      );
    }
  } else {
    return candidates[0].name;
  }
}

export async function nextOrPrevAction(opts: {
  nextOrPrev: "next" | "prev";
  numSteps: number;
  interactive: boolean;
}): Promise<void> {
  // Support stepping over n branches.
  for (let i = 0; i < opts.numSteps; i++) {
    const currentBranch = currentBranchPrecondition();
    const branch =
      opts.nextOrPrev === "next"
        ? await getNextBranch(currentBranch, opts.interactive)
        : getPrevBranch(currentBranch);

    // Print indented branch names to show traversal.
    if (branch && branch !== currentBranch.name) {
      execSync(`git checkout "${branch}"`, { stdio: "ignore" });
      const indent = opts.nextOrPrev === "next" ? i : opts.numSteps - i - 1;
      logInfo(
        `${"  ".repeat(indent)}↳(${
          i === opts.numSteps - 1 ? chalk.cyan(branch) : branch
        })`
      );
    } else {
      return;
    }
  }
}
