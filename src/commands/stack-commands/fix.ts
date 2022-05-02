import { fixAction } from '../../actions/fix';
import { ExitFailedError } from '../../lib/errors';
import { profile } from '../../lib/telemetry';
import { argsT } from '../shared-commands/fix';
export { aliases, args, builder, command } from '../shared-commands/fix';

export const canonical = 'stack fix';
export const description =
  "Fix your stack of changes, either by recursively rebasing branches onto their parents, or by regenerating Graphite's stack metadata from the branch relationships in the git commit tree.";

export const handler = async (argv: argsT): Promise<void> => {
  return profile(argv, canonical, async (context) => {
    if (argv.rebase && argv.regen) {
      throw new ExitFailedError(
        'Please specify either the "--rebase" or "--regen" method, not both'
      );
    }
    await fixAction(
      {
        action: argv.rebase ? 'rebase' : argv.regen ? 'regen' : undefined,
        scope: 'FULLSTACK',
      },
      context
    );
  });
};
