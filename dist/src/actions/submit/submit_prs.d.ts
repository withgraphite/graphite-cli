import { API_ROUTES } from '@withgraphite/graphite-cli-routes';
import * as t from '@withgraphite/retype';
import { TContext } from '../../lib/context';
export declare type TPRSubmissionInfo = t.UnwrapSchemaMap<typeof API_ROUTES.submitPullRequests.params>['prs'];
export declare function submitPullRequest(args: {
    submissionInfo: TPRSubmissionInfo;
    cliAuthToken: string;
}, context: TContext): Promise<void>;
