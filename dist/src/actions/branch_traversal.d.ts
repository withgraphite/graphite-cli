import { TContext } from '../lib/context';
declare type TBranchNavigation = {
    direction: 'UP' | 'DOWN';
    numSteps: number;
} | {
    direction: 'TOP' | 'BOTTOM';
};
export declare function switchBranchAction(branchNavigation: TBranchNavigation, context: TContext): Promise<void>;
export {};
