import yargs from 'yargs';
import { restackBranches } from '../../actions/restack';
import { SCOPE } from '../../lib/engine/scope_spec';
import { graphite } from '../../lib/runner';

const args = {} as const;
type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;

export const aliases = ['r', 'fix', 'f'];
export const command = 'restack';
export const canonical = 'downstack restack';
export const description =
  'From trunk to the current branch, ensure each is based on its parent, rebasing if necessary.';
export const builder = args;
export const handler = async (argv: argsT): Promise<void> =>
  graphite(argv, canonical, async (context) => {
    context.splog.logTip(
      [
        `You are restacking with downstack scope.`,
        `In common cases, we recommend you use:`,
        `* gt stack restack`,
        `* gt upstack restack`,
        `because these will ensure any upstack branches will be restacked on their restacked parents.`,
        `If the current branch has any descendants, they will likely need a restack after this command.`,
      ].join('\n')
    );

    restackBranches({ relative: true, scope: SCOPE.DOWNSTACK }, context);
  });
