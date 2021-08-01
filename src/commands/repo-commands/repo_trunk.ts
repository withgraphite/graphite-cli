import chalk from "chalk";
import { profiledHandler } from "../../lib/telemetry";
import { getTrunk } from "../../lib/utils";

const args = {} as const;

export const command = "trunk";
export const description =
  "The trunk branch of the current repo, to use as the base of all stacks.";
export const builder = args;
export const handler = async (): Promise<void> => {
  return profiledHandler(command, async () => {
    console.log(`Infered trunk branch = (${chalk.green(getTrunk())})`);
  });
};
