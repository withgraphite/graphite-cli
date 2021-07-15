import { execSync } from "child_process";
import yargs from "yargs";
import AbstractCommand from "../abstract_command";

const args = {} as const;
type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;
export default class LogCommand extends AbstractCommand<typeof args> {
  static args = args;
  public async _execute(argv: argsT) {
    try {
      execSync(
        `git log --graph --abbrev-commit --decorate --format=format:'%C(bold blue)%h%C(reset) - %C(bold green)(%ar)%C(reset) %C(white)%s%C(reset) %C(dim white)- %an%C(reset)%C(bold yellow)%d%C(reset)' --all`,
        { stdio: "inherit" }
      );
    } catch (e) {
      // Ignore errors (this just means they quit git log)
    }
  }
}
