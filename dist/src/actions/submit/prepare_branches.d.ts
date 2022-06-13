import { TContext } from '../../lib/context';
import { TPRSubmissionInfo } from './submit_prs';
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
    branchNames: string[];
    editPRFieldsInline: boolean;
    draftToggle: boolean | undefined;
    updateOnly: boolean;
    dryRun: boolean;
    reviewers: boolean;
}, context: TContext): Promise<TPRSubmissionInfo>;
