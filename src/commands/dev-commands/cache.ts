import yargs from 'yargs';
import { initContext, initContextLite } from '../../lib/context';
import { getCacheLock } from '../../lib/engine/cache_lock';

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
export const handler = async (argv: argsT): Promise<void> => {
  const cacheLock = getCacheLock();
  cacheLock.lock();
  const context = initContext(initContextLite({ debug: true }));
  if (argv.clear) {
    context.metaCache.clear();
  }
  context.splog.debug(context.metaCache.debug);
  cacheLock.release();
};
