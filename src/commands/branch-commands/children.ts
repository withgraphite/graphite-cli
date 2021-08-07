import yargs from "yargs";
import { currentBranchPrecondition } from "../../lib/preconditions";
import { profile } from "../../lib/telemetry";
import { logInfo } from "../../lib/utils";

const args = {} as const;
type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;

export const command = "children";
export const description =
  "Show the children of your current branch, as recorded in Graphite's stacks.";
export const builder = args;
export const handler = async (argv: argsT): Promise<void> => {
  return profile(argv, async () => {
    const branch = currentBranchPrecondition();

    const children = branch.getChildrenFromMeta();
    if (children.length === 0) {
      logInfo(`(${branch}) has no stacked child branches`);
    } else {
      children.forEach((child) => console.log(child.name));
    }
  });
};
