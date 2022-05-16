import { TContext } from '../lib/context';
export declare function commitCreateAction(opts: {
    addAll: boolean;
    message: string | undefined;
}, context: TContext): Promise<void>;
