import yargs from 'yargs';
import { restackBranches } from '../../actions/restack';
import { graphite } from '../../lib/runner';

const args = {} as const;
type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;

export const aliases = ['r'];
export const command = 'restack';
export const canonical = 'branch restack';
export const description =
  'Ensure the current branch is based on its parent, rebasing if necessary.';
export const builder = args;
export const handler = async (argv: argsT): Promise<void> =>
  graphite(argv, canonical, async (context) => {
    context.splog.tip(
      [
        `You are restacking a specific branch.`,
        `In common cases, we recommend you use:`,
        `▸ gt stack restack`,
        `▸ gt upstack restack`,
        `because these will ensure any upstack branches will be restacked on their restacked parents.`,
        `If this branch has any descendants, they will likely need a restack after this command.`,
      ].join('\n')
    );

    restackBranches([context.metaCache.currentBranchPrecondition], context);
  });
