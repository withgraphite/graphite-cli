import { composeSplog } from '../utils/splog';

const NAV_WARNING = [
  'The `branch` commands `next` and `previous` (aka `bn` and `bp`) have been renamed.',
  'Please use `up` and `down` (aka `bu` and `bd`) respectively.',
].join('\n');

const INFO_WARNING = [
  'The `branch` command `show` has been renamed.',
  'Please use `info` (aka `gt bi`).',
].join('\n');

const GET_WARNING = [
  'The `downstack` command `sync` has been renamed.',
  'Please use `get` (aka `gt dsg`).',
].join('\n');

const FIX_WARNING = [
  'The `upstack` and `stack` command `fix` has been renamed.',
  'Please use `restack` (aka `gt sr`/`gt usr`).',
  'The `fix`/`f` alias will be removed in an upcoming version.',
].join('\n');

export function handleDeprecatedCommandNames(command: string[]): void {
  switch (command[0]) {
    case 'branch':
    case 'b':
      if (['next', 'n', 'previous', 'p'].includes(command[1])) {
        composeSplog().error(NAV_WARNING);
        // eslint-disable-next-line no-restricted-syntax
        process.exit(1);
      }
      if ('show' === command[1]) {
        composeSplog().error(INFO_WARNING);
        // eslint-disable-next-line no-restricted-syntax
        process.exit(1);
      }

      break;
    case 'downstack':
    case 'ds':
      if ('sync' === command[1]) {
        composeSplog().error(GET_WARNING);
        // eslint-disable-next-line no-restricted-syntax
        process.exit(1);
      }
      break;
    case 'upstack':
    case 'us':
    case 'stack':
    case 's':
      if (['fix', 'f'].includes(command[1])) {
        composeSplog().warn(FIX_WARNING);
      }
  }
}
