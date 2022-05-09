import { TContext } from '../../lib/context';
export declare function mergeDownstack(branchName: string, context: TContext): Promise<'ABORT' | 'CONTINUE'>;
