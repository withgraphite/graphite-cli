import graphiteCLIRoutes from '@withgraphite/graphite-cli-routes';
import * as t from '@withgraphite/retype';
import { TContext } from '../../lib/context/context';
import { Unpacked } from '../../lib/utils/ts_helpers';
import { Branch } from '../../wrapper-classes/branch';
declare type TPRSubmissionInfo = t.UnwrapSchemaMap<typeof graphiteCLIRoutes.submitPullRequests.params>['prs'];
export declare function submitPullRequests(args: {
    submissionInfoWithBranches: (Unpacked<TPRSubmissionInfo> & {
        branch: Branch;
    })[];
    cliAuthToken: string;
}, context: TContext): Promise<void>;
export {};
