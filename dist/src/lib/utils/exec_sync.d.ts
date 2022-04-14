/// <reference types="node" />
import { ExecSyncOptions } from 'child_process';
export declare type GPExecSyncOptions = {
    printStdout?: boolean;
};
export declare function gpExecSync(command: {
    command: string;
    options?: ExecSyncOptions & GPExecSyncOptions;
}, onError?: (e: any) => void): Buffer;
