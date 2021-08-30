import yargs from "yargs";
import { submitAction } from "../../actions/submit";
import { profile } from "../../lib/telemetry";

export const command = "submit";
export const description =
  "Idempotently force push the current branch to GitHub, creating or updating a pull request.";

const args = {
  draft: {
    describe:
      "Creates new PRs in draft mode. If --no-interactive is true, this is automatically set to true.",
    type: "boolean",
    alias: "d",
  },
  edit: {
    describe:
      "Edit PR fields inline. If --no-interactive is true, this is automatically set to false.",
    type: "boolean",
    default: true,
    alias: "e",
  },
} as const;
export const builder = args;
export const aliases = ["s"];
export type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;

export const handler = async (argv: argsT): Promise<void> => {
  await profile(argv, async () => {
    await submitAction({
      scope: "BRANCH",
      editPRFieldsInline: argv.edit,
      createNewPRsAsDraft: argv.draft,
    });
  });
};
