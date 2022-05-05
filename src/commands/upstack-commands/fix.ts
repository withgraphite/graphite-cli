import { fixAction } from '../../actions/fix';
import { profile } from '../../lib/telemetry/profile';
import { argsT } from '../shared-commands/fix';
export { aliases, args, builder, command } from '../shared-commands/fix';

export const canonical = 'upstack fix';
export const description =
  'Fix your changes upstack from the current branch by recursively rebasing branches onto their parents.';

export const handler = async (argv: argsT): Promise<void> => {
  return profile(argv, canonical, async (context) => {
<<<<<<< HEAD
    fixAction({ scope: 'UPSTACK' }, context);
||||||| parent of 87405014 (feat: remove sf ==regen)
    if (argv.rebase && argv.regen) {
      throw new ExitFailedError(
        'Please specify either the "--rebase" or "--regen" method, not both'
      );
    }
    await fixAction(
      {
        action: argv.rebase ? 'rebase' : argv.regen ? 'regen' : undefined,
        scope: 'UPSTACK',
      },
      context
    );
=======
    fixAction('UPSTACK', context);
>>>>>>> 87405014 (feat: remove sf ==regen)
  });
};
