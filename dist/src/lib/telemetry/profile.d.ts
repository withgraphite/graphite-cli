import yargs from 'yargs';
import { TContext } from '../context';
export declare function profile(args: yargs.Arguments, canonicalName: string, handler: (context: TContext) => Promise<void>): Promise<void>;
