import { submitAction } from "../../actions/submit";
import { profile } from "../../lib/telemetry";
import type { argsT } from "../shared-commands/submit";

export { aliases, args, builder, command } from "../shared-commands/submit";
export const description =
  "Idempotently force push the current branch to GitHub, creating or updating a pull request.";

export const handler = async (argv: argsT): Promise<void> => {
  await profile(argv, async () => {
    await submitAction({
      scope: "BRANCH",
      editPRFieldsInline: argv.edit,
      createNewPRsAsDraft: argv.draft,
    });
  });
};
