import fs from 'fs-extra';
import path from 'path';
import tmp from 'tmp';
import yargs from 'yargs';
import {
  readMetadataRef,
  writeMetadataRef,
} from '../../lib/engine/metadata_ref';
import { ExitFailedError } from '../../lib/errors';
import { graphite } from '../../lib/runner';
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
} as const;

export const command = 'meta <branch>';
export const canonical = 'dev meta';
export const description = false;
export const builder = args;

// This command allows for direct access to the metadata ref. USE WITH CARE!
type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;
export const handler = async (argv: argsT): Promise<void> => {
  return graphite(argv, canonical, async (context) => {
    const metaString = cuteString(readMetadataRef(argv.branch));
    if (!argv.edit) {
      context.splog.logInfo(metaString);
      return;
    }
    const tmpfilePath = path.join(tmp.dirSync().name, 'meta');
    fs.writeFileSync(tmpfilePath, metaString);
    gpExecSync(
      {
        command: `${context.userConfig.getEditor()} "${tmpfilePath}"`,
        options: { stdio: 'inherit' },
      },
      (err) => {
        throw new ExitFailedError(
          'Failed to prompt for meta edit. Aborting...',
          err
        );
      }
    );
    writeMetadataRef(argv.branch, fs.readJSONSync(tmpfilePath));
    context.metaCache.rebuild();
  });
};
