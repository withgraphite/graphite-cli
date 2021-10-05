import { submitAction } from "../../actions/submit";
import { profile } from "../../lib/telemetry";
import type { argsT } from "../shared-commands/submit";

export { aliases, builder, command } from "../shared-commands/submit";
export const description =
  "Idempotently force push all downstack branches (including the current one) to GitHub, creating or updating distinct pull requests for each.";

export const handler = async (argv: argsT): Promise<void> => {
  await profile(argv, async () => {
    await submitAction({
      scope: "DOWNSTACK",
      editPRFieldsInline: argv.edit,
      createNewPRsAsDraft: argv.draft,
      dryRun: argv["dry-run"],
    });
  });
};
