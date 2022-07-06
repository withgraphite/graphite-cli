"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCacheLock = void 0;
const errors_1 = require("../errors");
const cache_lock_spf_1 = require("../spiffy/cache_lock_spf");
function getCacheLock() {
    return {
        lock: () => {
            const cacheLockConfig = cache_lock_spf_1.cacheLockConfigFactory.load();
            if (cacheLockConfig.data.pid || cacheLockConfig.data.timestamp) {
                throw new errors_1.ConcurrentExecutionError();
            }
            cacheLockConfig.update((data) => {
                data.pid = process.pid;
                data.timestamp = Date.now();
            });
        },
        release: () => cache_lock_spf_1.cacheLockConfigFactory.load().delete(),
    };
}
exports.getCacheLock = getCacheLock;
//# sourceMappingURL=cache_lock.js.map