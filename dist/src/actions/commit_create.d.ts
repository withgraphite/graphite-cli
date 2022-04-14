import { TContext } from '../lib/context/context';
export declare function commitCreateAction(opts: {
    addAll: boolean;
    message: string | undefined;
}, context: TContext): Promise<void>;
