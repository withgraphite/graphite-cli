import { fixAction } from '../../actions/fix';
import { profile } from '../../lib/telemetry/profile';
import { argsT } from '../shared-commands/fix';
export { aliases, args, builder, command } from '../shared-commands/fix';

export const canonical = 'stack fix';
export const description =
  'Fix your stack of changes by recursively rebasing branches onto their parents.';

export const handler = async (argv: argsT): Promise<void> => {
<<<<<<< HEAD
  return profile(argv, canonical, async (context) =>
    fixAction({ scope: 'FULLSTACK' }, context)
  );
||||||| parent of 87405014 (feat: remove sf ==regen)
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
=======
  return profile(argv, canonical, async (context) =>
    fixAction({ scope: 'FULLSTACK' }, context)
  );
>>>>>>> 87405014 (feat: remove sf ==regen)
};
