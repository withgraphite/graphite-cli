import chalk from 'chalk';
import { TContext } from '../../lib/context';
import { TBranchPRInfo } from '../../lib/engine/metadata_ref';
import { detectUnsubmittedChanges } from '../../lib/git/detect_unsubmitted_changes';
import { getPRBody } from './pr_body';
import { getPRDraftStatus } from './pr_draft';
import { getPRTitle } from './pr_title';
import { getReviewers } from './reviewers';
import { TSubmittedPRRequest } from './submit_action';

type TPRSubmissionAction = { branchName: string } & (
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
    branchNames: string[];
    editPRFieldsInline: boolean;
    draftToggle: boolean | undefined;
    updateOnly: boolean;
    dryRun: boolean;
    reviewers: boolean;
  },
  context: TContext
): Promise<TSubmittedPRRequest[]> {
  context.splog.logInfo(
    chalk.blueBright('🥞 Preparing to submit PRs for the following branches...')
  );

  const branchActions = args.branchNames
    .map((branchName) =>
      getPRAction(
        {
          branchName,
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
    const parentBranchName = context.metaCache.getParentPrecondition(
      action.branchName
    );
    submissionInfo.push({
      head: action.branchName,
      headSha: context.metaCache.getRevision(action.branchName),
      base: parentBranchName,
      baseSha: context.metaCache.getRevision(parentBranchName),
      ...(action.update
        ? {
            action: 'update' as const,
            prNumber: action.prNumber,
            draft: args.draftToggle,
          }
        : {
            action: 'create' as const,
            ...(await getPRCreationInfo(
              {
                branchName: action.branchName,
                editPRFieldsInline: args.editPRFieldsInline,
                draftToggle: args.draftToggle,
                reviewers: args.reviewers,
              },
              context
            )),
          }),
    });
  }
  context.splog.logNewline();
  return submissionInfo;
}

function getPRAction(
  args: {
    branchName: string;
    updateOnly: boolean;
    draftToggle: boolean | undefined;
    dryRun: boolean;
  },
  context: TContext
): TPRSubmissionAction | undefined {
  // The branch here should always have a parent - above, the branches we've
  // gathered should exclude trunk which ensures that every branch we're submitting
  // a PR for has a valid parent.
  const parentBranchName = context.metaCache.getParentPrecondition(
    args.branchName
  );
  const prInfo = context.metaCache.getPrInfo(args.branchName);
  const prNumber = prInfo?.number;

  const status =
    prNumber === undefined
      ? args.updateOnly
        ? 'NOOP'
        : 'CREATE'
      : parentBranchName !== prInfo?.base
      ? 'RESTACK'
      : detectUnsubmittedChanges(args.branchName)
      ? 'CHANGE'
      : args.draftToggle === undefined
      ? 'NOOP'
      : args.draftToggle
      ? 'DRAFT'
      : 'PUBLISH';

  context.splog.logInfo(
    `▸ ${chalk.cyan(args.branchName)} (${
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
        branchName: args.branchName,
        ...(prNumber === undefined
          ? { update: false }
          : { update: true, prNumber }),
      };
}

async function getPRCreationInfo(
  args: {
    branchName: string;
    editPRFieldsInline: boolean;
    draftToggle: boolean | undefined;
    reviewers: boolean;
  },
  context: TContext
): Promise<{
  title: string;
  body: string;
  reviewers: string[];
  draft: boolean;
}> {
  if (context.interactive) {
    context.splog.logNewline();
    context.splog.logInfo(
      `Enter info for new pull request for ${chalk.yellow(
        args.branchName
      )} ▸ ${context.metaCache.getParentPrecondition(args.branchName)}:`
    );
  }

  const submitInfo: TBranchPRInfo = {};

  try {
    submitInfo.title = await getPRTitle(
      {
        branchName: args.branchName,
        editPRFieldsInline: args.editPRFieldsInline,
      },
      context
    );

    submitInfo.body = await getPRBody(
      {
        branchName: args.branchName,
        editPRFieldsInline: args.editPRFieldsInline,
      },
      context
    );
  } finally {
    // Save locally in case this command fails
    context.metaCache.upsertPrInfo(args.branchName, submitInfo);
  }

  const reviewers = await getReviewers({
    fetchReviewers: args.reviewers,
  });

  const createAsDraft = args.draftToggle ?? (await getPRDraftStatus(context));

  return {
    title: submitInfo.title,
    body: submitInfo.body,
    reviewers,
    draft: createAsDraft,
  };
}
