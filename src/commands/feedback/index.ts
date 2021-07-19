import chalk from "chalk";
import fetch from "node-fetch";
import yargs from "yargs";
import { userEmail } from "../../lib/telemetry";
import AbstractCommand from "../abstract_command";

const args = {
  message: {
    type: "string",
    postitional: true,
    describe: "Postive or constructive. Jokes are chill too.",
  },
} as const;
type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;

export default class FeedbackCommand extends AbstractCommand<typeof args> {
  static args = args;
  public async _execute(argv: argsT): Promise<void> {
    const user = userEmail();
    const response = await fetch(
      `https://api.graphite.dev/v1/graphite/feedback`,
      {
        method: "POST",
        body: JSON.stringify({
          user: user || "NotFound",
          message: argv.message,
        }),
      }
    );
    if (response.status == 200) {
      console.log(
        chalk.green(
          `Feedback received loud and clear (in a team Slack channel) :)`
        )
      );
    } else {
      console.log(
        chalk.yellow(
          `Failed to report feedback, network response ${response.status}`
        )
      );
      process.exit(1);
    }
  }
}
