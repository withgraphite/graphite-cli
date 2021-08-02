import chalk from "chalk";
import fs from "fs-extra";
import prompts from "prompts";
import { repoConfig } from "../lib/config";
import { PreconditionsFailedError } from "../lib/errors";
import { currentGitRepoPrecondition } from "../lib/preconditions";
import { logInfo } from "../lib/utils";
import { inferTrunk } from "../lib/utils/trunk";
import Branch from "../wrapper-classes/branch";
export async function init(
  trunk?: string,
  ignoreBranches?: string[]
): Promise<void> {
  currentGitRepoPrecondition();
  const allBranches = Branch.allBranches();
  logWelcomeMessage();

  // Trunk
  let newTrunkName: string;
  if (trunk) {
    if (Branch.exists(trunk)) {
      newTrunkName = trunk;
      repoConfig.setTrunk(newTrunkName);
      logInfo(`Trunk set to (${newTrunkName})`);
    } else {
      throw new PreconditionsFailedError(
        `Cannot set (${trunk}) as trunk, branch not found in current repo.`
      );
    }
  } else {
    newTrunkName = await selectTrunkBranch(allBranches);
    repoConfig.setTrunk(newTrunkName);
  }

  // Ignore Branches
  if (ignoreBranches) {
    ignoreBranches.forEach((branchName) => {
      if (!Branch.exists(branchName)) {
        throw new PreconditionsFailedError(
          `Cannot set (${branchName}) to be ignore, branch not found in current repo.`
        );
      }
    });
    repoConfig.setIgnoreBranches(ignoreBranches);
  } else {
    const ignoreBranches = await selectIgnoreBranches(
      allBranches,
      newTrunkName
    );
    repoConfig.setIgnoreBranches(ignoreBranches);
  }

  logInfo(`Graphite repo config saved at "${repoConfig.path()}"`);
  logInfo(fs.readFileSync(repoConfig.path()).toString());
}

function logWelcomeMessage(): void {
  console.log("Welcome to Graphite!");
}

async function selectIgnoreBranches(
  allBranches: Branch[],
  trunk: string
): Promise<string[]> {
  const branchesWithoutTrunk = allBranches.filter((b) => b.name != trunk);
  if (branchesWithoutTrunk.length === 0) {
    return [];
  }
  const response = await prompts({
    type: "multiselect",
    name: "branches",
    message: `Ignore Branches: select any permanent branches never to be stacked (such as "prod" or "staging"). ${chalk.yellow(
      "Fine to select none."
    )}`,
    choices: branchesWithoutTrunk.map((b) => {
      return { title: b.name, value: b.name };
    }),
  });
  return response.branches;
}

async function selectTrunkBranch(allBranches: Branch[]): Promise<string> {
  const trunk = inferTrunk();
  const response = await prompts({
    type: "autocomplete",
    name: "branch",
    message: `Select a trunk branch, which you open PR's against${
      trunk ? ` [infered trunk (${chalk.green(trunk.name)})]` : ""
    }`,
    choices: allBranches.map((b) => {
      return { title: b.name, value: b.name };
    }),
    ...(trunk ? { initial: trunk.name } : {}),
  });
  return response.branch;
}
