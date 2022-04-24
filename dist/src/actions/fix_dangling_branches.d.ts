import { TContext } from './../lib/context/context';
export declare function fixDanglingBranches(context: TContext, opts: {
    force: boolean;
    showSyncTip?: boolean;
}): Promise<void>;
