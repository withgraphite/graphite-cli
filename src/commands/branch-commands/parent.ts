import chalk from "chalk";
import yargs from "yargs";
import {
  branchExistsPrecondition,
  currentBranchPrecondition,
} from "../../lib/preconditions";
import { profile } from "../../lib/telemetry";
import { logInfo } from "../../lib/utils";
import Branch from "../../wrapper-classes/branch";

const args = {
  set: {
    type: "string",
    describe:
      "Manually set the stack parent of the current branch. This operation only modifies Graphite metadata and does not rebase any branches.",
    required: false,
  },
} as const;
type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;

export const command = "parent";
export const description =
  "Show the parent of your current branch, as recorded in Graphite's stacks. Parent information is stored under `.git/refs/branch-metadata`.";
export const builder = args;
export const handler = async (argv: argsT): Promise<void> => {
  return profile(argv, async () => {
    const branch = currentBranchPrecondition();
    if (argv.set) {
      setParent(branch, argv.set);
    } else {
      const parent = branch.getParentFromMeta();
      if (parent) {
        console.log(parent.name);
      } else {
        logInfo(
          `Current branch (${branch}) has no Graphite parent set. Consider running \`gp branch parent --set <parent>\`, \`gp stack fix\`, or \`gp upstack onto <parent>\` to set a Graphite parent branch.`
        );
      }
    }
  });
};

function setParent(branch: Branch, parent: string): void {
  branchExistsPrecondition(parent);
  const oldParent = branch.getParentFromMeta();
  branch.setParentBranchName(parent);
  logInfo(
    `Updated (${branch}) parent from (${oldParent}) to (${chalk.green(parent)})`
  );
  return;
}
