import yargs from 'yargs';
import { initContext } from '../../lib/context';

export const command = 'cache';
export const canonical = 'dev cache';
export const description = false;

const args = {
  clear: {
    type: 'boolean',
    default: false,
    alias: 'c',
  },
} as const;
export const builder = args;

type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;
export const handler = async (argv: argsT): Promise<void> =>
  argv.clear
    ? initContext({ globalArguments: { debug: true } }).metaCache.clear()
    : initContext({ globalArguments: { debug: true } }).metaCache.debug();
