import { ConcurrentExecutionError } from '../errors';
import { cacheLockConfigFactory } from '../spiffy/cache_lock_spf';

export type TCacheLock = {
  lock: () => void;
  release: () => void;
};
export function getCacheLock(): TCacheLock {
  return {
    lock: () => {
      const cacheLockConfig = cacheLockConfigFactory.load();
      if (cacheLockConfig.data.pid || cacheLockConfig.data.timestamp) {
        throw new ConcurrentExecutionError();
      }
      cacheLockConfig.update((data) => {
        data.pid = process.pid;
        data.timestamp = Date.now();
      });
    },
    release: () => cacheLockConfigFactory.load().delete(),
  };
}
