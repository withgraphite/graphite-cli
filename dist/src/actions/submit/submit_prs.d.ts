import graphiteCLIRoutes from '@withgraphite/graphite-cli-routes';
import * as t from '@withgraphite/retype';
import { TContext } from '../../lib/context';
export declare type TPRSubmissionInfo = t.UnwrapSchemaMap<typeof graphiteCLIRoutes.submitPullRequests.params>['prs'];
export declare function submitPullRequest(args: {
    submissionInfo: TPRSubmissionInfo;
    cliAuthToken: string;
}, context: TContext): Promise<void>;
