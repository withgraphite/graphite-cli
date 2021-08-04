import chalk from "chalk";
import yargs from "yargs";
import { profile } from "../../lib/telemetry";
import { getTrunk } from "../../lib/utils";

const args = {} as const;

export const command = "trunk";
export const description =
  "The trunk branch of the current repo, to use as the base of all stacks.";
export const builder = args;

type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;
export const handler = async (argv: argsT): Promise<void> => {
  return profile(argv, async () => {
    console.log(`Infered trunk branch = (${chalk.green(getTrunk())})`);
  });
};
