import { TContext } from '../lib/context';
export declare function splitCurrentBranch(args: {
    style: 'hunk' | 'commit' | undefined;
}, context: TContext): Promise<void>;
