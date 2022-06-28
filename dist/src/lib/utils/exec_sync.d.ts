/// <reference types="node" />
import { ExecSyncOptions, SpawnSyncReturns } from 'child_process';
import { TSplog } from './splog';
declare type GPExecSyncOptions = {
    printStdout?: {
        splog: TSplog;
        transform?: (out: string) => string;
    };
} & Omit<ExecSyncOptions, 'encoding'>;
export declare function gpExecSyncAndSplitLines(command: {
    command: string;
    options?: ExecSyncOptions & GPExecSyncOptions;
}): string[];
export declare function gpExecSync(command: {
    command: string;
    options?: GPExecSyncOptions;
}, onError?: (e: Error & SpawnSyncReturns<string>) => void): string;
export {};
