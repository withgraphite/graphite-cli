import chalk from "chalk";
import { printStack } from "../actions/print_stack";
import { profiledHandler } from "../lib/telemetry";
import { getTrunk } from "../lib/utils/trunk";
import Branch from "../wrapper-classes/branch";

const args = {} as const;

export const command = "log";
export const description = "Log all stacks";
export const builder = args;

export const handler = async (): Promise<void> => {
  return profiledHandler(command, async () => {
    try {
      printTrunkLog();
      await printStacksBehindTrunk();
    } catch (e) {
      // Ignore errors (this just means they quit git log)
    }
  });
};

function printTrunkLog(): void {
  const trunk = getTrunk();
  printStack(trunk, 0, {
    currentBranch: Branch.getCurrentBranch(),
    offTrunk: true,
  });
}

async function printStacksBehindTrunk(): Promise<void> {
  const trunk = getTrunk();
  const branchesWithoutParents = (
    await Branch.getAllBranchesWithoutParents()
  ).filter((branch) => branch.name !== trunk.name);
  if (branchesWithoutParents.length === 0) {
    return;
  }

  console.log("․");
  console.log(
    `․ ${chalk.red(
      `Stacks below trail ${trunk.name}. To fix, check out the stack and run \`gp stack fix\`.`
    )}`
  );
  console.log("․");

  branchesWithoutParents.forEach((branch) => {
    console.log("․");
    printStack(branch, 1, {
      currentBranch: Branch.getCurrentBranch(),
      offTrunk: false,
    });
    console.log(`◌──┘`);
    console.log("․");
  });
}
