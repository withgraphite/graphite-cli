import graphiteCLIRoutes from "@screenplaydev/graphite-cli-routes";
import { request } from "@screenplaydev/retyped-routes";
import chalk from "chalk";
import yargs from "yargs";
import { API_SERVER } from "../lib/api";
import { ExitFailedError } from "../lib/errors";
import { getUserEmail, profile } from "../lib/telemetry";

const args = {
  message: {
    type: "string",
    postitional: true,
    describe:
      "Postive or constructive feedback for the Graphite team! Jokes are chill too.",
  },
} as const;
type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;

export const command = "feedback <message>";
export const description =
  "Post a string directly to the maintainers' Slack where they can factor in your feedback, laugh at your jokes, cry at your insults, or test the bounds of Slack injection attacks.";
export const builder = args;

export const handler = async (argv: argsT): Promise<void> => {
  return profile(argv, async () => {
    const user = getUserEmail();
    const response = await request.requestWithArgs(
      API_SERVER,
      graphiteCLIRoutes.feedback,
      {
        user: user || "NotFound",
        message: argv.message || "",
        debugContext: undefined,
      }
    );
    if (response._response.status == 200) {
      console.log(
        chalk.green(
          `Feedback received loud and clear (in a team Slack channel) :)`
        )
      );
    } else {
      throw new ExitFailedError(
        `Failed to report feedback, network response ${response.status}`
      );
    }
  });
};
