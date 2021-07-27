import yargs from "yargs";
import SubmitCommand from "../original-commands/submit";

export const command = "submit";
export const description =
  "Experimental: Create PR's for each branch in the current stack";
export const builder = SubmitCommand.args;
type argsT = yargs.Arguments<
  yargs.InferredOptionTypes<typeof SubmitCommand.args>
>;
export const handler = async (argv: argsT): Promise<void> => {
  await new SubmitCommand().execute(argv);
};
