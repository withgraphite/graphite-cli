import { TContext } from '../../lib/context';
import { TStackEdit } from './stack_edits';
export declare function editDownstack(context: TContext, opts?: {
    inputPath?: string;
}): Promise<void>;
export declare function applyStackEdits(fromBranchName: string, stackEdits: TStackEdit[], context: TContext): void;
