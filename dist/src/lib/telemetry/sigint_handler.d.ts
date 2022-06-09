import { TCacheLock } from '../engine/cache_lock';
export declare function registerSigintHandler(opts: {
    commandName: string;
    canonicalCommandName: string;
    startTime: number;
    cacheLock: TCacheLock | undefined;
}): void;
