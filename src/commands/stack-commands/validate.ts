import yargs from "yargs";
import ValidateCommand from "../original-commands/validate";

export const command = "validate";
export const description =
  "Validates that the gp meta graph matches the current graph of git branches and commits.";
export const builder = ValidateCommand.args;
type argsT = yargs.Arguments<
  yargs.InferredOptionTypes<typeof ValidateCommand.args>
>;
export const handler = async (argv: argsT): Promise<void> => {
  await new ValidateCommand().execute(argv);
};
