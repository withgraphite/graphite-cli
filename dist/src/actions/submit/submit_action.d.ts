import graphiteCLIRoutes from '@withgraphite/graphite-cli-routes';
import * as t from '@withgraphite/retype';
import { TContext } from '../../lib/context';
import { Unpacked } from '../../lib/utils/ts_helpers';
import { Branch } from '../../wrapper-classes/branch';
import { TScope } from '../scope';
export declare type TSubmitScope = TScope | 'BRANCH';
export declare type TSubmittedPRRequest = Unpacked<t.UnwrapSchemaMap<typeof graphiteCLIRoutes.submitPullRequests.params>['prs']>;
export declare type TPRSubmissionInfoWithBranch = TSubmittedPRRequest & {
    branch: Branch;
};
export declare type TPRSubmissionInfoWithBranches = TPRSubmissionInfoWithBranch[];
export declare function submitAction(args: {
    scope: TSubmitScope;
    editPRFieldsInline: boolean;
    draftToggle: boolean | undefined;
    dryRun: boolean;
    updateOnly: boolean;
    branchesToSubmit?: Branch[];
    reviewers: boolean;
    confirm: boolean;
}, context: TContext): Promise<void>;
