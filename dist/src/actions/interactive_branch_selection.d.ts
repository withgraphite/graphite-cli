import { TContext } from '../lib/context';
export declare function interactiveBranchSelection(context: TContext, opts: {
    message: string;
    omitCurrentUpstack?: boolean;
}): Promise<string>;
