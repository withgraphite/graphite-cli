import { TContext } from '../../lib/context';
/**
 * This method is assumed to be idempotent -- if a merge conflict interrupts
 * execution of this method, we simply restart the method upon running `gt
 * continue`.
 *
 * It returns a list of branches whose parents have changed so that we know
 * which branches to restack.
 */
export declare function cleanBranches(opts: {
    showDeleteProgress: boolean;
    force: boolean;
}, context: TContext): Promise<string[]>;
