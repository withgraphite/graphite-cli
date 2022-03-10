import { TContext } from '../lib/context/context';
export declare enum TraversalDirection {
    Top = "TOP",
    Bottom = "BOTTOM",
    Next = "NEXT",
    Previous = "PREV"
}
export declare function switchBranchAction(direction: TraversalDirection, opts: {
    numSteps?: number;
    interactive: boolean;
}, context: TContext): Promise<void>;
