#!/usr/bin/env node
import chalk from "chalk";
import { execSync } from "child_process";
import { logErrorAndExit } from "../lib/utils";
import Branch from "../wrapper-classes/branch";

export async function nextOrPrevAction(
  nextOrPrev: "next" | "prev",
  silent: boolean
): Promise<void> {
  const currentBranch = Branch.getCurrentBranch();
  if (currentBranch === null) {
    logErrorAndExit(`Not currently on branch, cannot find ${nextOrPrev}.`);
  }

  const candidates =
    nextOrPrev === "next"
      ? await currentBranch.getChildrenFromGit()
      : await currentBranch.getParentsFromGit();

  if (candidates.length === 0) {
    if (!silent) {
      console.log(chalk.yellow(`Found no ${nextOrPrev} branch`));
    }
    process.exit(1);
  }
  if (candidates.length > 1) {
    if (!silent) {
      console.log(chalk.yellow(`Found multiple possibilities:`));
      for (const candidate of candidates) {
        console.log(chalk.yellow(` - ${candidate.name}`));
      }
    }
    process.exit(1);
  }

  const branchName = candidates.values().next().value.name;
  execSync(`git checkout "${branchName}"`, { stdio: "ignore" });
  console.log(branchName);
}
