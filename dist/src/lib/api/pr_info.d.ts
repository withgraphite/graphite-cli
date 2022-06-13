import graphiteCLIRoutes from '@withgraphite/graphite-cli-routes';
import t from '@withgraphite/retype';
import { TRepoParams } from './common_params';
declare type TBranchNameWithPrNumber = {
    branchName: string;
    prNumber: number | undefined;
};
export declare type TPRInfoToUpsert = t.UnwrapSchemaMap<typeof graphiteCLIRoutes.pullRequestInfo.response>['prs'];
export declare function getPrInfoForBranches(branchNamesWithExistingPrInfo: TBranchNameWithPrNumber[], params: TRepoParams): Promise<TPRInfoToUpsert>;
export {};
