import { TContext } from '../lib/context/context';
export declare function interactiveBranchSelection(context: TContext, opts: {
    message: string;
    omitCurrentUpstack?: boolean;
}): Promise<string>;
