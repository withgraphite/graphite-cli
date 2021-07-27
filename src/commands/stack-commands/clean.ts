import yargs from "yargs";
import SyncCommand from "../original-commands/sync";

export const command = "clean";
export const description =
  "Delete any stacks that have been merged or squashed into your trunk branch, and restack their children recursively.";
export const builder = SyncCommand.args;
type argsT = yargs.Arguments<
  yargs.InferredOptionTypes<typeof SyncCommand.args>
>;
export const handler = async (argv: argsT): Promise<void> => {
  await new SyncCommand().execute(argv);
};
