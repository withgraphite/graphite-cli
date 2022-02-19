import { TStackEdit } from './stack_edits';
export declare function editDownstack(opts?: {
    inputPath?: string;
}): Promise<void>;
export declare function applyStackEdits(stackEdits: TStackEdit[]): Promise<void>;
