import graphiteCLIRoutes from "@screenplaydev/graphite-cli-routes";
import * as t from "@screenplaydev/retype";
import { Unpacked } from "../../lib/utils/ts_helpers";
import Branch from "../../wrapper-classes/branch";
import { TScope } from "./../scope";
declare type TSubmitScope = TScope | "BRANCH";
export declare function submitAction(args: {
    scope: TSubmitScope;
    editPRFieldsInline: boolean;
    createNewPRsAsDraft: boolean | undefined;
    dryRun: boolean;
}): Promise<void>;
export declare function submitBranches(args: {
    branchesToSubmit: Branch[];
    cliAuthToken: string;
    repoOwner: string;
    repoName: string;
    editPRFieldsInline: boolean;
    createNewPRsAsDraft: boolean | undefined;
}): Promise<void>;
declare type TSubmittedPRRequest = Unpacked<t.UnwrapSchemaMap<typeof graphiteCLIRoutes.submitPullRequests.params>["prs"]>;
declare type TSubmittedPRResponse = Unpacked<t.UnwrapSchemaMap<typeof graphiteCLIRoutes.submitPullRequests.response>["prs"]>;
declare type TSubmittedPR = {
    request: TSubmittedPRRequest;
    response: TSubmittedPRResponse;
};
export declare function saveBranchPRInfo(prs: TSubmittedPR[]): void;
export {};
