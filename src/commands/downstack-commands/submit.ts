import { submitAction } from "../../actions/submit";
import { profile } from "../../lib/telemetry";
import {
  aliases,
  argsT,
  builder,
  command,
  description,
} from "../stack-commands/submit";

export { command, description, builder, aliases };
export const handler = async (argv: argsT): Promise<void> => {
  await profile(argv, async () => {
    await submitAction({
      scope: "DOWNSTACK",
      editPRFieldsInline: argv.edit,
      createNewPRsAsDraft: argv.draft,
    });
  });
};
