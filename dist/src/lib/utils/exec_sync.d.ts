/// <reference types="node" />
import { ExecSyncOptions, SpawnSyncReturns } from 'child_process';
export declare type GPExecSyncOptions = {
    printStdout?: boolean | ((out: string) => string);
};
export declare function gpExecSync(command: {
    command: string;
    options?: ExecSyncOptions & GPExecSyncOptions;
}, onError?: (e: Error & SpawnSyncReturns<Buffer>) => void): Buffer;
