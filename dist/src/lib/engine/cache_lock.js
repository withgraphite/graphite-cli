"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCacheLock = void 0;
const cache_lock_config_1 = require("../config/cache_lock_config");
const errors_1 = require("../errors");
function getCacheLock() {
    return {
        lock: () => {
            const cacheLockConfig = cache_lock_config_1.cacheLockConfigFactory.load();
            if (cacheLockConfig.data.pid || cacheLockConfig.data.timestamp) {
                throw new errors_1.ConcurrentExecutionError();
            }
            cacheLockConfig.update((data) => {
                data.pid = process.pid;
                data.timestamp = Date.now();
            });
        },
        release: () => cache_lock_config_1.cacheLockConfigFactory.load().delete(),
    };
}
exports.getCacheLock = getCacheLock;
//# sourceMappingURL=cache_lock.js.map