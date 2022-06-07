import { cacheLockConfigFactory } from '../config/cache_lock_config';
import { ConcurrentExecutionError } from '../errors';

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
