/// <reference types="node" />
import { ExecSyncOptions } from 'child_process';
declare type GPExecSyncOptions = Omit<ExecSyncOptions, 'encoding'>;
export declare function gpExecSyncAndSplitLines(...args: Parameters<typeof gpExecSync>): string[];
export declare function gpExecSync(command: {
    command: string;
    options?: GPExecSyncOptions;
    onError: (() => void) | 'throw' | 'ignore';
}): string;
export {};
