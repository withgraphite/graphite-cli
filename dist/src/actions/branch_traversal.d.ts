import { TContext } from '../lib/context/context';
export declare enum TraversalDirection {
    Top = "TOP",
    Bottom = "BOTTOM",
    Up = "UP",
    Down = "DOWN"
}
export declare function switchBranchAction(direction: TraversalDirection, opts: {
    numSteps?: number;
    interactive: boolean;
}, context: TContext): Promise<void>;
