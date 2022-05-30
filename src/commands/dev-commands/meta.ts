import fs from 'fs-extra';
import path from 'path';
import tmp from 'tmp';
import yargs from 'yargs';
import { ExitFailedError } from '../../lib/errors';
import {
  readMetadataRef,
  writeMetadataRef,
} from '../../lib/state/metadata_ref';
import { profile } from '../../lib/telemetry/profile';
import { cuteString } from '../../lib/utils/cute_string';
import { gpExecSync } from '../../lib/utils/exec_sync';

const args = {
  branch: {
    demandOption: true,
    type: 'string',
    positional: true,
  },
  edit: {
    type: 'boolean',
    default: false,
    alias: 'e',
  },
  ['text-editor']: {
    type: 'string',
    default: 'vi',
    alias: 't',
  },
} as const;

export const command = 'meta <branch>';
export const canonical = 'dev meta';
export const description = false;
export const builder = args;

// This command allows for direct access to the metadata ref. USE WITH CARE!
type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;
export const handler = async (argv: argsT): Promise<void> => {
  return profile(argv, canonical, async (context) => {
    const metaString = cuteString(readMetadataRef(argv.branch));
    if (!argv.edit) {
      context.splog.logInfo(metaString);
      return;
    }
    const tmpfilePath = path.join(tmp.dirSync().name, 'meta');
    fs.writeFileSync(tmpfilePath, metaString);
    gpExecSync(
      {
        command: `${argv['text-editor']} "${tmpfilePath}"`,
        options: { stdio: 'inherit' },
      },
      (err) => {
        throw new ExitFailedError(
          'Failed to prompt for meta edit. Aborting...',
          err
        );
      }
    );
    return writeMetadataRef(argv.branch, fs.readJSONSync(tmpfilePath));
    // TODO: once we start persisting cache to disk, consider clearing it manually here?
  });
};
