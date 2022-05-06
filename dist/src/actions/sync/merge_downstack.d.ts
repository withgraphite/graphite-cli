import { TContext } from '../../lib/context/context';
export declare function mergeDownstack(branchName: string, context: TContext): Promise<'ABORT' | 'CONTINUE'>;
