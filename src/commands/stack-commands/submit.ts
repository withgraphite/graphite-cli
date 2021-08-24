import yargs from "yargs";
import { submitAction } from "../../actions/submit";
import { profile } from "../../lib/telemetry";

export const command = "submit";
export const description =
  "Idempotently force push all branches in the current stack to GitHub, creating or updating distinct pull requests for each.";

/**
 * Primary interaction patterns:
 *
 * # (default) allows user to edit PR fields inline and then submits stack as a draft
 * gt stack submit
 *
 * # skips editing PR fields inline, submits stack as a draft
 * gt stack submit --no-edit
 *
 * # allows user to edit PR fields inline, then publishes
 * gt stack submit --no-draft
 *
 * # same as gt stack submit --no-edit
 * gt stack submit --no-interactive
 *
 */
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
      scope: "FULLSTACK",
      editPRFieldsInline: argv.edit,
      createNewPRsAsDraft: argv.draft,
    });
  });
};
