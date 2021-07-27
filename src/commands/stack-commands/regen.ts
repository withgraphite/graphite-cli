import yargs from "yargs";
import FixCommand from "../original-commands/fix";

export const command = "regen";
export const description =
  "Trace the current branch through its parents, down to the base branch. Establish dependencies between each branch for later traversal and fixing.";
export const builder = FixCommand.args;
type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof FixCommand.args>>;
export const handler = async (argv: argsT): Promise<void> => {
  await new FixCommand().execute(argv);
};
