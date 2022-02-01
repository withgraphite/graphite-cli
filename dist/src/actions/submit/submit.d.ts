import * as t from '@screenplaydev/retype';
import graphiteCLIRoutes from 'graphite-cli-routes';
import { Unpacked } from '../../lib/utils/ts_helpers';
import Branch from '../../wrapper-classes/branch';
import { TScope } from '../scope';
export declare type TSubmitScope = TScope | 'BRANCH';
declare type TSubmittedPRRequest = Unpacked<t.UnwrapSchemaMap<typeof graphiteCLIRoutes.submitPullRequests.params>['prs']>;
declare type TSubmittedPRResponse = Unpacked<t.UnwrapSchemaMap<typeof graphiteCLIRoutes.submitPullRequests.response>['prs']>;
declare type TSubmittedPR = {
    request: TSubmittedPRRequest;
    response: TSubmittedPRResponse;
};
export declare function submitAction(args: {
    scope: TSubmitScope;
    editPRFieldsInline: boolean;
    createNewPRsAsDraft: boolean | undefined;
    dryRun: boolean;
    updateOnly: boolean;
    branchesToSubmit?: Branch[];
    reviewers: boolean;
}): Promise<void>;
export declare function saveBranchPRInfo(prs: TSubmittedPR[]): void;
export {};
