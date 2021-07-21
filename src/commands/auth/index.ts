import yargs, { config } from "yargs";
import { logSuccess, updateUserConfig } from "../../lib/utils";
import AbstractCommand from "../abstract_command";

const args = {
  token: {
    type: "string",
    alias: "t",
    describe: "The auth token for the current session",
    demandOption: true,
  },
} as const;
type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;
export default class AuthCommand extends AbstractCommand<typeof args> {
  static args = args;
  public async _execute(argv: argsT): Promise<void> {
    updateUserConfig({
      ...config,
      authToken: argv.token,
    });
    logSuccess("🔐 Successfully authenticated!");
  }
}
