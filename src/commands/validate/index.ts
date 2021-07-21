import chalk from "chalk";
import yargs from "yargs";
import { log } from "../../lib/log";
import { logWarn } from "../../lib/utils";
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
export default class ValidateCommand extends AbstractCommand<typeof args> {
  static args = args;
  public async _execute(argv: argsT): Promise<void> {
    const branch = Branch.getCurrentBranch();
    if (branch === null) {
      logWarn("Not currently on a branch; no stack to validate.");
      return;
    }

    await validateBranch(branch, argv);
    log(`Current stack is valid`, argv);
  }
}

async function validateBranch(branch: Branch, opts: argsT) {
  const metaChildren = await branch.getChildrenFromMeta();
  const gitChildren = branch.getChildrenFromGit();
  const hasGitChildren = gitChildren && gitChildren.length > 0;
  const hasMetaChildren = metaChildren.length > 0;
  if (hasGitChildren && !hasMetaChildren) {
    throw new Error(`${branch.name} missing a child in graphite's meta graph`);
  }
  if (!hasGitChildren && hasMetaChildren) {
    throw new Error(`Unable to find child branches in git for ${branch.name}`);
  }
  if (!hasGitChildren && !hasMetaChildren) {
    // Assume to be a trunk branch and implicately valid.
    log(`✅ ${chalk.green(`(${branch.name}) validated`)}`, opts);
    return;
  }
  const gitChildrenMissingInMeta = gitChildren!.filter(
    (gitChild) => !metaChildren!.map((b) => b.name).includes(gitChild.name)
  );
  if (gitChildrenMissingInMeta.length > 0) {
    throw new Error(
      `Child branches [${gitChildrenMissingInMeta
        .map((b) => `(${b.name})`)
        .join(", ")}] not found in graphite's meta graph.`
    );
  }
  log(`✅ ${chalk.green(`(${branch.name}) validated`)}`, opts);
  for (const child of metaChildren!) {
    await validateBranch(child, opts);
  }
}
