import { TContext } from './../lib/context/context';
export declare function existsDanglingBranches(context: TContext): boolean;
export declare function fixDanglingBranches(context: TContext, force: boolean): Promise<void>;
