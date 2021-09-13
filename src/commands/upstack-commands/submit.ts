import { submitAction } from "../../actions/submit";
import { profile } from "../../lib/telemetry";
import { argsT } from "../shared-commands/submit";

export { aliases, args, builder, command } from "../shared-commands/submit";
export const description =
  "Idempotently force push the upstack branches to GitHub, creating or updating pull requests as necessary.";
export const canonical = "upstack submit";

export const handler = async (argv: argsT): Promise<void> => {
  await profile(argv, canonical, async () => {
    await submitAction({
      scope: "UPSTACK",
      editPRFieldsInline: argv.edit,
      createNewPRsAsDraft: argv.draft,
      dryRun: argv["dry-run"],
    });
  });
};
