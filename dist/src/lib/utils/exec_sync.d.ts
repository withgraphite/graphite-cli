/// <reference types="node" />
import { ExecSyncOptions, SpawnSyncReturns } from 'child_process';
export declare type GPExecSyncOptions = {
    printStdout?: boolean | ((out: string) => string);
} & Omit<ExecSyncOptions, 'encoding'>;
export declare function gpExecSync(command: {
    command: string;
    options?: GPExecSyncOptions;
}, onError?: (e: Error & SpawnSyncReturns<string>) => void): string;
