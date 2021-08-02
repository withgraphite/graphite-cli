import chalk from "chalk";
import prompts from "prompts";
import { repoConfig } from "../lib/config";
import { PreconditionsFailedError } from "../lib/errors";
import { currentGitRepoPrecondition } from "../lib/preconditions";
import { logInfo } from "../lib/utils";
import { inferTrunk } from "../lib/utils/trunk";
import Branch from "../wrapper-classes/branch";
export async function init(trunk?: string): Promise<void> {
  currentGitRepoPrecondition();
  const allBranches = Branch.allBranches();
  logWelcomeMessage();
  if (trunk) {
    if (Branch.exists(trunk)) {
      repoConfig.setTrunk(trunk);
      logInfo(`Trunk set to (${trunk})`);
    } else {
      throw new PreconditionsFailedError(
        `Cannot set (${trunk}) as trunk, branch not found in current repo.`
      );
    }
  } else {
    const newTrunkName = await selectTrunkBranch(allBranches);
    repoConfig.setTrunk(newTrunkName);
  }
  logInfo(`Graphite repo config saved at "${repoConfig.path()}"`);
}

function logWelcomeMessage(): void {
  console.log("Welcome to Graphite!");
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
