import { TContext } from '../../lib/context/context';
import { TStackEdit, TStackEditPick } from './stack_edits';
export declare function applyStackEditPick(stackEdit: TStackEditPick, remainingEdits: TStackEdit[], context: TContext): Promise<void>;
