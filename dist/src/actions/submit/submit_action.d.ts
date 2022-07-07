import { TContext } from '../../lib/context';
import { TScopeSpec } from '../../lib/engine/scope_spec';
export declare function submitAction(args: {
    scope: TScopeSpec;
    editPRFieldsInline: boolean;
    draft: boolean;
    publish: boolean;
    dryRun: boolean;
    updateOnly: boolean;
    reviewers: boolean;
    confirm: boolean;
}, context: TContext): Promise<void>;
