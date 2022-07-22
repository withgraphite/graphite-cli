import fs from 'fs-extra';
import yargs from 'yargs';

import path from 'path';
import { graphiteWithoutRepo } from '../lib/runner';
const args = {} as const;

type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;

export const command = 'changelog';
export const canonical = 'changelog';
export const aliases = ['changelog'];
export const description = 'Show the Graphite CLI changelog.';
export const builder = args;
export const handler = async (argv: argsT): Promise<void> =>
  graphiteWithoutRepo(argv, canonical, async (context) => {
    context.splog.info(
      fs.readFileSync(path.join(__dirname, '..', '..', '..', '.CHANGELOG.md'), {
        encoding: 'utf-8',
      })
    );
  });
