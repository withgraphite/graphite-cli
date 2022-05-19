import { TContext } from '../lib/context';
export declare function commitAmendAction(opts: {
    addAll: boolean;
    message?: string;
    noEdit: boolean;
}, context: TContext): Promise<void>;
