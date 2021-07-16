import chalk from "chalk";
import yargs from "yargs";
import { log } from "../../lib/log";
import Branch from "../../wrapper-classes/branch";
import AbstractCommand from "../abstract_command";

const args = {
  silent: {
    describe: `silence output from the command`,
    demandOption: false,
    default: false,
    type: "boolean",
    alias: "s",
  },
} as const;
type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;
export default class FixCommand extends AbstractCommand<typeof args> {
  static args = args;
  public async _execute(argv: argsT) {
    const branch = await Branch.getCurrentBranch();

    printBranchNameStack(
      `(Original  git derived stack)`,
      branch.stackByTracingGitParents(),
      argv
    );
    printBranchNameStack(
      `(Original meta derived stack)`,
      branch.stackByTracingMetaParents(),
      argv
    );

    // Walk the current branch down to the base and create stacks.
    await recursiveFix(branch, argv);

    printBranchNameStack(
      `(New meta stack)`,
      branch.stackByTracingMetaParents(),
      argv
    );
  }
}

function printBranchNameStack(message: string, names: string[], opts: argsT) {
  log(
    `[${names.map((name) => `(${chalk.green(name)})`).join("->")}] ${message}`,
    opts
  );
}

async function recursiveFix(branch: Branch, opts: argsT) {
  const gitParents = branch.getParentsFromGit();

  if (!gitParents) {
    log(
      `-> (${branch.name}) has no git parent branches and so is considered to be the base`,
      opts
    );
    return;
  }
  // Check if we're at a base branch
  if (gitParents.length === 0) {
    log(
      `-> (${branch.name}) has no git parent branches and so is considered to be the base`,
      opts
    );
    return;
  }

  const metaParent = branch.getParentFromMeta();

  if (
    metaParent &&
    gitParents.some((gitParent) => gitParent.name == metaParent.name)
  ) {
    log(
      `-> (${branch.name}) has matching meta and git parent branch (${metaParent.name}), no update`,
      opts
    );
    await recursiveFix(metaParent, opts);
  } else if (gitParents.length === 1) {
    if (metaParent) {
      log(
        `-> (${branch.name}) has meta parent branch (${
          metaParent.name
        }) but git parent branch (${gitParents[0].name}), ${chalk.green(
          "updating"
        )}`,
        opts
      );
    } else {
      log(
        `-> (${branch.name}) has no meta parent branch but git parent branch (${
          gitParents[0].name
        }), ${chalk.green("updating")}`,
        opts
      );
    }
    branch.setParentBranchName(gitParents[0].name);
    await recursiveFix(gitParents[0], opts);
  } else if (metaParent && gitParents.length > 1) {
    log(
      `-> (${branch.name}) has meta parent branch (${
        metaParent.name
      }) but multiple git parent branches [${gitParents
        .map((b) => `(${b.name})`)
        .join(", ")}]. ${chalk.red("Cannot continue")}`,
      opts
    );
    process.exit(1);
  } else if (!metaParent && gitParents.length > 1) {
    log(
      `-> (${
        branch.name
      }) has no meta parent branch but multiple git parent branches [${gitParents
        .map((b) => `(${b.name})`)
        .join(", ")}].  ${chalk.red("Cannot continue")}`,
      opts
    );
    process.exit(1);
  } else {
    log(
      chalk.yellow(
        `Error: No fix patern detected for git: ${gitParents}, meta: ${metaParent}, exiting`
      ),
      opts
    );
    process.exit(1);
  }
}
