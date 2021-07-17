#!/usr/bin/env node
import chalk from "chalk";
import { execSync } from "child_process";
import yargs from "yargs";
import Branch, {
  MAX_COMMITS_TO_TRAVERSE_FOR_NEXT_OR_PREV,
} from "../../wrapper-classes/branch";
import AbstractCommand from "../abstract_command";

const args = {} as const;
type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;
export class NextCommand extends AbstractCommand<typeof args> {
  static args = args;
  public async _execute(argv: argsT) {
    await nextOrPrev("next");
  }
}
export class PrevCommand extends AbstractCommand<typeof args> {
  static args = args;
  public async _execute(argv: argsT) {
    await nextOrPrev("prev");
  }
}

async function nextOrPrev(nextOrPrev: "next" | "prev") {
  const currentBranch = Branch.getCurrentBranch();

  const candidates =
    nextOrPrev === "next"
      ? await currentBranch.getChildrenFromGit()
      : await currentBranch.getParentsFromGit();

  if (!candidates) {
    console.log(
      chalk.yellow(
        `Searched ${MAX_COMMITS_TO_TRAVERSE_FOR_NEXT_OR_PREV} and could not find ${nextOrPrev} branch`
      )
    );
    process.exit(1);
  }

  if (candidates.length === 0) {
    console.log(chalk.yellow(`Found no ${nextOrPrev} branch`));
    process.exit(1);
  }
  if (candidates.length > 1) {
    console.log(chalk.yellow(`Found multiple possibilities:`));
    for (const candidate of candidates) {
      console.log(chalk.yellow(` - ${candidate.name}`));
    }
    process.exit(1);
  }

  const branchName = candidates.values().next().value.name;
  execSync(`git checkout "${branchName}"`, { stdio: "ignore" });
}
