import { TContext } from '../../lib/context/context';
import { Branch } from '../../wrapper-classes/branch';
import { TScope } from '../scope';
export declare type TSubmitScope = TScope | 'BRANCH';
export declare function submitAction(args: {
    scope: TSubmitScope;
    editPRFieldsInline: boolean;
    draftToggle: boolean | undefined;
    dryRun: boolean;
    updateOnly: boolean;
    branchesToSubmit?: Branch[];
    reviewers: boolean;
}, context: TContext): Promise<void>;
export declare function detectEmptyBranches(submittableBranches: Branch[], context: TContext): Promise<'SUCCESS' | 'ABORT'>;
