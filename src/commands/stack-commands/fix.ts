import { fixAction } from '../../actions/fix';
import { profile } from '../../lib/telemetry/profile';
import { argsT } from '../shared-commands/fix';
export { aliases, args, builder, command } from '../shared-commands/fix';

export const canonical = 'stack fix';
export const description =
  'Fix your stack of changes by recursively rebasing branches onto their parents.';

export const handler = async (argv: argsT): Promise<void> => {
  return profile(argv, canonical, async (context) =>
    fixAction('FULLSTACK', context)
  );
};
