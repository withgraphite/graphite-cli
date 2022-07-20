import { TContext } from '../lib/context';
import { TCommitOpts } from '../lib/git/commit';
export declare function squashCurrentBranch(opts: Pick<TCommitOpts, 'message' | 'noEdit'>, context: TContext): void;
