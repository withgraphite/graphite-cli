/// <reference types="node" />
import { SpawnSyncOptions } from 'child_process';
declare type TRunCommandParameters = {
    command: string;
    args: string[];
    options?: Omit<SpawnSyncOptions, 'encoding'>;
    onError: (() => void) | 'throw' | 'ignore';
};
export declare function runGitCommandAndSplitLines(params: Omit<TRunCommandParameters, 'command'> & {
    resource: string | null;
}): string[];
export declare function runGitCommand(params: Omit<TRunCommandParameters, 'command'> & {
    resource: string | null;
}): string;
export declare function runCommand(params: TRunCommandParameters): string;
export {};
