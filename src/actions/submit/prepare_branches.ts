import chalk from 'chalk';
import { TContext } from '../../lib/context';
import { PreconditionsFailedError } from '../../lib/errors';
import { detectUnsubmittedChanges } from '../../lib/git/detect_unsubmitted_changes';
import { getBranchRevision } from '../../lib/git/get_branch_revision';
import { Branch } from '../../wrapper-classes/branch';
import { TBranchPRInfo } from '../../wrapper-classes/metadata_ref';
import { getPRBody } from './pr_body';
import { getPRDraftStatus } from './pr_draft';
import { getPRTitle } from './pr_title';
import { getReviewers } from './reviewers';
import {
  TPRSubmissionInfoWithBranch,
  TPRSubmissionInfoWithBranches,
} from './submit_action';

type TPRSubmissionAction = { branch: Branch; parent: Branch } & (
  | { update: false }
  | {
      update: true;
      prNumber: number;
    }
);

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
export async function getPRInfoForBranches(
  args: {
    branches: Branch[];
    editPRFieldsInline: boolean;
    draftToggle: boolean | undefined;
    updateOnly: boolean;
    dryRun: boolean;
    reviewers: boolean;
  },
  context: TContext
): Promise<TPRSubmissionInfoWithBranches> {
  context.splog.logInfo(
    chalk.blueBright('🥞 Preparing to submit PRs for the following branches...')
  );

  const branchActions = args.branches
    .map((branch) =>
      getPRAction(
        {
          branch,
          updateOnly: args.updateOnly,
          draftToggle: args.draftToggle,
          dryRun: args.dryRun,
        },
        context
      )
    )
    .filter((action): action is TPRSubmissionAction => action !== undefined);

  const submissionInfo = [];
  for await (const action of branchActions) {
    submissionInfo.push(
      action.update
        ? {
            action: 'update' as const,
            prNumber: action.prNumber,
            draft: args.draftToggle,
            head: action.branch.name,
            headSha: getBranchRevision(action.branch.name),
            base: action.parent.name,
            baseSha: action.branch.getParentBranchSha(),
            branch: action.branch,
          }
        : await getPRCreationInfo(
            {
              branch: action.branch,
              parentBranchName: action.parent.name,
              editPRFieldsInline: args.editPRFieldsInline,
              draftToggle: args.draftToggle,
              reviewers: args.reviewers,
            },
            context
          )
    );
  }
  context.splog.logNewline();
  return submissionInfo;
}

function getPRAction(
  args: {
    branch: Branch;
    updateOnly: boolean;
    draftToggle: boolean | undefined;
    dryRun: boolean;
  },
  context: TContext
): TPRSubmissionAction | undefined {
  // The branch here should always have a parent - above, the branches we've
  // gathered should exclude trunk which ensures that every branch we're submitting
  // a PR for has a valid parent.
  const parent = args.branch.getParentFromMeta(context);
  if (parent === undefined) {
    throw new PreconditionsFailedError(
      `Could not find parent for branch ${args.branch.name} to submit PR against. Please checkout ${args.branch.name} and run \`gt upstack onto <parent_branch>\` to set its parent.`
    );
  }
  const prNumber = context.metaCache.getPrInfo(args.branch.name)?.number;

  const status =
    prNumber === undefined
      ? args.updateOnly
        ? 'NOOP'
        : 'CREATE'
      : args.branch.isBaseSameAsRemotePr(context)
      ? 'RESTACK'
      : detectUnsubmittedChanges(args.branch)
      ? 'CHANGE'
      : args.draftToggle === undefined
      ? 'NOOP'
      : args.draftToggle
      ? 'DRAFT'
      : 'PUBLISH';

  context.splog.logInfo(
    `▸ ${chalk.cyan(args.branch.name)} (${
      {
        CREATE: 'Create',
        CHANGE: 'Update - code changes/rebase',
        DRAFT: 'Convert to draft - set draft status',
        NOOP: 'No-op',
        PUBLISH: 'Ready for review - set draft status',
        RESTACK: 'Update - restacked',
      }[status]
    })`
  );
  return args.dryRun || status === 'NOOP'
    ? undefined
    : {
        branch: args.branch,
        parent,
        ...(prNumber === undefined
          ? { update: false }
          : { update: true, prNumber }),
      };
}

async function getPRCreationInfo(
  args: {
    branch: Branch;
    parentBranchName: string;
    editPRFieldsInline: boolean;
    draftToggle: boolean | undefined;
    reviewers: boolean;
  },
  context: TContext
): Promise<TPRSubmissionInfoWithBranch> {
  if (context.interactive) {
    context.splog.logNewline();
    context.splog.logInfo(
      `Enter info for new pull request for ${chalk.yellow(
        args.branch.name
      )} ▸ ${args.parentBranchName}:`
    );
  }

  const submitInfo: TBranchPRInfo = {};

  try {
    submitInfo.title = await getPRTitle(
      {
        branch: args.branch,
        editPRFieldsInline: args.editPRFieldsInline,
      },
      context
    );

    submitInfo.body = await getPRBody(
      {
        branch: args.branch,
        editPRFieldsInline: args.editPRFieldsInline,
      },
      context
    );
  } finally {
    // Save locally in case this command fails
    context.metaCache.upsertPrInfo(args.branch.name, submitInfo);
  }

  const reviewers = await getReviewers({
    fetchReviewers: args.reviewers,
  });

  const createAsDraft = args.draftToggle ?? (await getPRDraftStatus(context));

  return {
    title: submitInfo.title,
    body: submitInfo.body,
    reviewers,
    action: 'create',
    draft: createAsDraft,
    head: args.branch.name,
    headSha: getBranchRevision(args.branch.name),
    base: args.parentBranchName,
    baseSha: args.branch.getParentBranchSha(),
    branch: args.branch,
  };
}
