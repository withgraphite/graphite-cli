import { TContext } from '../lib/context/context';
import { Stack } from '../wrapper-classes';
import { TScope } from './scope';
import { TSubmitScope } from './submit/submit';
export declare function validateStack(scope: TSubmitScope, stack: Stack, context: TContext): void;
export declare function validate(scope: TScope, context: TContext): void;
