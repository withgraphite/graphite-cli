import fs from 'fs-extra';
import path from 'path';
import tmp from 'tmp';
import yargs from 'yargs';
import {
  readMetadataRef,
  writeMetadataRef,
} from '../../lib/engine/metadata_ref';
import { graphite } from '../../lib/runner';
import { cuteString } from '../../lib/utils/cute_string';
import { runCommand } from '../../lib/utils/run_command';

const args = {
  branch: {
    demandOption: true,
    type: 'string',
    positional: true,
    hidden: true,
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
      context.splog.info(metaString);
      return;
    }
    const tmpfilePath = path.join(tmp.dirSync().name, 'meta');
    fs.writeFileSync(tmpfilePath, metaString);
    runCommand({
      command: context.userConfig.getEditor(),
      args: [tmpfilePath],
      options: { stdio: 'inherit' },
      onError: 'throw',
    });
    writeMetadataRef(argv.branch, fs.readJSONSync(tmpfilePath));
    context.metaCache.rebuild();
  });
};
