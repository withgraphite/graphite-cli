import { TContext } from '../../lib/context/context';
import { TStackEdit } from './stack_edits';
export declare function editDownstack(context: TContext, opts?: {
    inputPath?: string;
}): Promise<void>;
export declare function applyStackEdits(stackEdits: TStackEdit[], context: TContext): void;
