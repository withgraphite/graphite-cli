import { TContext } from '../lib/context';
export declare function fixDanglingBranches(context: TContext, opts: {
    force: boolean;
    showSyncTip?: boolean;
}): Promise<void>;
