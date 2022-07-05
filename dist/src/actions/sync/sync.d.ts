import { TContext } from '../../lib/context';
export declare function syncAction(opts: {
    pull: boolean;
    force: boolean;
    delete: boolean;
    showDeleteProgress: boolean;
    restack: boolean;
}, context: TContext): Promise<void>;
export declare function pullTrunk(context: TContext): void;
