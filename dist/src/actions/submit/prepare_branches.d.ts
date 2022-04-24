import { TContext } from '../../lib/context/context';
import { Branch } from '../../wrapper-classes/branch';
import { TSubmittedPRRequest } from './submit';
declare type TSubmittedPRRequestWithBranch = TSubmittedPRRequest & {
    branch: Branch;
};
declare type TPRSubmissionInfoWithBranch = TSubmittedPRRequestWithBranch[];
/**
 * For now, we only allow users to update the following PR properties which
 * necessitate a PR update:
 * - the PR base
 * - the PR's code contents
 *
 * Notably, we do not yet allow users to update the PR title, body, etc.
 *
 * Therefore, we should only update the PR iff either of these properties
 * differ from our stored data on the previous PR submission.
 */
export declare function getPRInfoForBranches(args: {
    branches: Branch[];
    editPRFieldsInline: boolean;
    draftToggle: boolean | undefined;
    updateOnly: boolean;
    dryRun: boolean;
    reviewers: boolean;
}, context: TContext): Promise<TPRSubmissionInfoWithBranch>;
export {};
