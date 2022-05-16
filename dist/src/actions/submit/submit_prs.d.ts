import graphiteCLIRoutes from '@withgraphite/graphite-cli-routes';
import * as t from '@withgraphite/retype';
import { TContext } from '../../lib/context';
import { Unpacked } from '../../lib/utils/ts_helpers';
import { TPRSubmissionInfoWithBranch, TSubmittedPRRequest } from './submit_action';
declare type TPRSubmissionInfo = t.UnwrapSchemaMap<typeof graphiteCLIRoutes.submitPullRequests.params>['prs'];
declare type TSubmittedPRResponse = Unpacked<t.UnwrapSchemaMap<typeof graphiteCLIRoutes.submitPullRequests.response>['prs']>;
declare type TSubmittedPR = {
    request: TSubmittedPRRequest;
    response: TSubmittedPRResponse;
};
export declare function submitPullRequest(args: {
    submissionInfoWithBranch: TPRSubmissionInfoWithBranch;
    cliAuthToken: string;
}, context: TContext): Promise<void>;
export declare function requestServerToSubmitPRs(cliAuthToken: string, submissionInfo: TPRSubmissionInfo, context: TContext): Promise<TSubmittedPR[]>;
export declare function handlePRReponse(pr: TSubmittedPR): {
    errorMessage?: string;
};
export {};
