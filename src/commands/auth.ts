import yargs from "yargs";
import { profiledHandler } from "../lib/telemetry";
import { logSuccess, setUserAuthToken } from "../lib/utils";

const args = {
  token: {
    type: "string",
    alias: "t",
    describe: "The auth token for the current session",
    demandOption: true,
  },
} as const;
type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;

export const command = "auth";
export const description = "Authenticate current Graphite CLI";
export const builder = args;

export const handler = async (argv: argsT): Promise<void> => {
  return profiledHandler(command, async () => {
    setUserAuthToken(argv.token);
    logSuccess("🔐 Successfully authenticated!");
  });
};
