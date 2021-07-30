import yargs from "yargs";
import { log } from "../../lib/log";
import { currentBranchPrecondition } from "../../lib/preconditions";
import { profile } from "../../lib/telemetry";

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

export const command = "children";
export const description =
  "Show the children of your current branch, as recorded in Graphite's stacks.";
export const builder = args;
export const handler = async (argv: argsT): Promise<void> => {
  return profile(argv, async () => {
    const branch = currentBranchPrecondition();

    const children = await branch.getChildrenFromMeta();
    if (children.length === 0) {
      log(`(${branch}) has no stacked child branches`, argv);
    } else {
      children.forEach((child) => console.log(child.name));
    }
  });
};
