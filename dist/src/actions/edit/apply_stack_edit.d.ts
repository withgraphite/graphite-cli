import { TContext } from '../../lib/context';
import { TStackEdit } from './stack_edits';
export declare function applyStackEditPick(opts: {
    branchName: string;
    remainingEdits: TStackEdit[];
}, context: TContext): void;
export declare function applyStackEditExec(opts: {
    command: string;
    remainingEdits: TStackEdit[];
}, context: TContext): void;
