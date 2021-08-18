import yargs from "yargs";
import { submitAction } from "../../actions/submit";
import { globalArgs } from "../../lib/global-arguments";
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
    describe: "Creates new PRs in draft mode.",
    type: "boolean",
    default: true,
    alias: "d",
  },
  edit: {
    describe: "Edit PR fields inline.",
    type: "boolean",
    default: true,
    alias: "e",
  },
} as const;
type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;
export const builder = args;
export const aliases = ["s"];

export const handler = async (argv: argsT): Promise<void> => {
  await profile(argv, async () => {
    await submitAction({
      scope: "FULLSTACK",
      editPRFieldsInline: argv.edit && globalArgs.interactive,
      createNewPRsAsDraft: argv.draft,
    });
  });
};
