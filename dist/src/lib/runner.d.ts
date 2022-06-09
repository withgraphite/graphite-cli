import yargs from 'yargs';
import { TContext, TContextLite } from './context';
import { TGlobalArguments } from './global_arguments';
export declare function graphite(args: yargs.Arguments & TGlobalArguments, canonicalName: string, handler: (context: TContext) => Promise<void>): Promise<void>;
export declare function graphiteLite(args: yargs.Arguments & TGlobalArguments, canonicalName: string, handler: (context: TContextLite) => Promise<void>): Promise<void>;
