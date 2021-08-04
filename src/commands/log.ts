import chalk from "chalk";
import { printStack } from "../actions/print_stack";
import { profile } from "../lib/telemetry";
import { getTrunk } from "../lib/utils/trunk";
import Branch from "../wrapper-classes/branch";
import { execSync } from "child_process";
import yargs from "yargs";

const args = {} as const;

export const command = "log";
export const description = "Log all stacks";
export const builder = args;
export const aliases = ["l"];

type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;
export const handler = async (argv: argsT): Promise<void> => {
  return profile(argv, async () => {
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
  console.log("․");
  console.log(`․  ${chalk.bold(`Stack(s) below trail ${trunk.name}.`)}`);
  console.log(
    `․  To fix a stack, check out the stack and run \`gp stack fix\`.`
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
