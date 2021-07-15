import chalk from "chalk";
import { execSync } from "child_process";
import yargs from "yargs";
import Branch from "../../wrapper-classes/branch";
import AbstractCommand from "../abstract_command";
import PrintStacksCommand from "../print-stacks";
import ValidateCommand from "../validate";

const args = {
  silent: {
    describe: `silence output from the command`,
    demandOption: false,
    default: false,
    type: "boolean",
    alias: "s",
  },
  "from-commits": {
    describe: "The name of the target which builds your app for release",
    demandOption: false,
    type: "boolean",
    default: false,
  },
  fill: {
    describe: "Do not prompt for title/body and just use commit info",
    demandOption: false,
    type: "boolean",
    default: false,
    alias: "f",
  },
} as const;
type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;
export default class SubmitCommand extends AbstractCommand<typeof args> {
  static args = args;
  public async _execute(argv: argsT): Promise<void> {
    try {
      execSync(`gh --version`);
    } catch {
      console.log(chalk.red(`Could not find bash tool 'gh', please install`));
      process.exit(1);
    }
    try {
      execSync(`gh auth status`);
    } catch (err) {
      console.log(
        chalk.red(
          `"gh auth status" indicates that you are not currently authed to GitHub`
        )
      );
      process.exit(1);
    }

    try {
      await new ValidateCommand().executeUnprofiled({ silent: true });
    } catch {
      await new PrintStacksCommand().executeUnprofiled(argv);
      throw new Error(`Validation failed before submitting.`);
    }

    let currentBranch: Branch | undefined = await Branch.getCurrentBranch();
    const stackOfBranches: Branch[] = [];
    while (
      currentBranch != undefined &&
      currentBranch.getParentFromMeta() != undefined // dont put up pr for a base branch like "main"
    ) {
      stackOfBranches.push(currentBranch);
      const parentBranchName: string | undefined =
        currentBranch.getParentFromMeta()?.name;
      if (parentBranchName) {
        currentBranch = await Branch.branchWithName(parentBranchName);
      } else {
        currentBranch = undefined;
      }
    }

    // Create PR's for oldest branches first.
    stackOfBranches.reverse();

    stackOfBranches.forEach((branch, i) => {
      const parentBranch: undefined | Branch =
        i > 0 ? stackOfBranches[i - 1] : undefined;
      execSync(
        [
          `gh pr create`,
          `--head ${branch.name}`,
          ...(parentBranch ? [`--base ${parentBranch.name}`] : []),
          ...(argv.quick ? [`-f`] : []),
        ].join(" "),
        { stdio: "inherit" }
      );
    });
  }
}
