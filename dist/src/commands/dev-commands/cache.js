"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = exports.builder = exports.description = exports.canonical = exports.command = void 0;
const context_1 = require("../../lib/context");
const cache_lock_1 = require("../../lib/engine/cache_lock");
exports.command = 'cache';
exports.canonical = 'dev cache';
exports.description = false;
const args = {
    clear: {
        type: 'boolean',
        default: false,
        alias: 'c',
    },
};
exports.builder = args;
const handler = async (argv) => {
    const cacheLock = (0, cache_lock_1.getCacheLock)();
    cacheLock.lock();
    const context = (0, context_1.initContext)((0, context_1.initContextLite)({ debug: true }));
    if (argv.clear) {
        context.metaCache.clear();
    }
    context.splog.debug(context.metaCache.debug);
    cacheLock.release();
};
exports.handler = handler;
//# sourceMappingURL=cache.js.map