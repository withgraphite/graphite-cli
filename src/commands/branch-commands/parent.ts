import chalk from 'chalk';
import yargs from 'yargs';
import { TContext } from '../../lib/context/context';
import {
  branchExistsPrecondition,
  currentBranchPrecondition,
} from '../../lib/preconditions';
import { profile } from '../../lib/telemetry';
import { logInfo } from '../../lib/utils/splog';
import { Branch } from '../../wrapper-classes/branch';

const args = {
  set: {
    type: 'string',
    describe:
      'Manually set the stack parent of the current branch. This operation only modifies Graphite metadata and does not rebase any branches.',
    required: false,
  },
  reset: {
    type: 'boolean',
    describe: 'Disassociate the branch from its current tracked parent.',
    required: false,
  },
} as const;
type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;

export const command = 'parent';
export const canonical = 'branch parent';
export const description =
  'Show the parent branch of your current branch (i.e. directly below the current branch in the stack) as tracked by Graphite. Branch location metadata is stored under `.git/refs/branch-metadata`.';
export const builder = args;
export const handler = async (argv: argsT): Promise<void> => {
  return profile(argv, canonical, async (context) => {
    const branch = currentBranchPrecondition(context);
    if (argv.set) {
      setParent(branch, argv.set, context);
    } else if (argv.reset) {
      branch.clearParentMetadata();
    } else {
      const parent = branch.getParentFromMeta(context);
      if (parent) {
        console.log(parent.name);
      } else {
        logInfo(
          `Current branch (${branch}) has no parent branch set in Graphite. Consider running \`gt stack fix\`, or \`gt upstack onto <parent>\` to set a parent branch in Graphite.`
        );
      }
    }
  });
};

function setParent(branch: Branch, parent: string, context: TContext): void {
  branchExistsPrecondition(parent);
  const oldParent = branch.getParentFromMeta(context);
  branch.setParentBranchName(parent);
  logInfo(
    `Updated (${branch}) parent from (${oldParent}) to (${chalk.green(parent)})`
  );
  return;
}
