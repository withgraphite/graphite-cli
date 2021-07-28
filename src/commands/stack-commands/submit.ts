import yargs from "yargs";
import { submitAction } from "../../actions/submit";
import { profiledHandler } from "../../lib/telemetry";

export const command = "submit";
export const description =
  "Experimental: Idempotently force pushes all branches in stack and creates/updates PR's for each.";

const args = {
  silent: {
    describe: `silence output from the command`,
    demandOption: false,
    default: false,
    type: "boolean",
    alias: "s",
  },
  "from-commits": {
    describe: "The name of the target which builds your app for release",
    demandOption: false,
    type: "boolean",
    default: false,
  },
  fill: {
    describe: "Do not prompt for title/body and just use commit info",
    demandOption: false,
    type: "boolean",
    default: false,
    alias: "f",
  },
} as const;
type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;
export const builder = args;

export const handler = async (argv: argsT): Promise<void> => {
  await profiledHandler(command, async () => {
    await submitAction({
      silent: argv.silent,
      fromCommits: argv["from-commits"],
      fill: argv.fill,
    });
  });
};
