import { TContext } from '../lib/context';
import { TScopeSpec } from '../lib/engine/scope_spec';
export declare function testStack(opts: {
    scope: TScopeSpec;
    includeTrunk?: boolean;
    command: string;
}, context: TContext): void;
