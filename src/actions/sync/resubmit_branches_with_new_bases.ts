import prompts from 'prompts';
import { TContext } from '../../lib/context';
import { Branch } from '../../wrapper-classes/branch';
import { submitAction } from '../submit/submit_action';

export async function resubmitBranchesWithNewBases(
  force: boolean,
  context: TContext
): Promise<void> {
  const needsResubmission: Branch[] = [];
  Branch.allBranches(context, {
    filter: (b) => {
      const prState = b.getPRInfo()?.state;
      return (
        !b.isTrunk(context) &&
        b.getParentFromMeta(context) !== undefined &&
        prState !== 'MERGED' &&
        prState !== 'CLOSED'
      );
    },
  }).forEach((b) => {
    const currentBase = b.getParentFromMeta(context)?.name;
    const githubBase = b.getPRInfo()?.base;

    if (githubBase && githubBase !== currentBase) {
      needsResubmission.push(b);
    }
  });

  if (needsResubmission.length === 0) {
    return;
  }

  context.splog.logNewline();
  context.splog.logInfo(
    [
      `The following branches appear to have been rebased (or cherry-picked) in your local repo but changes have not yet propagated to PR (remote):`,
      ...needsResubmission.map((b) => `- ${b.name}`),
    ].join('\n')
  );

  context.splog.logTip(
    `Disable this check at any point in the future with --no-resubmit`
  );

  // Prompt for resubmission.
  let resubmit: boolean = force;
  if (!force) {
    const response = await prompts({
      type: 'confirm',
      name: 'value',
      message: `Update PR to propagate local rebase changes? (PR will be re-submitted)`,
      initial: true,
    });
    resubmit = response.value;
  }
  if (resubmit) {
    context.splog.logInfo(`Updating PR to propagate local rebase changes...`);
    await submitAction(
      {
        scope: 'FULLSTACK',
        editPRFieldsInline: false,
        draftToggle: false,
        dryRun: false,
        updateOnly: false,
        branchesToSubmit: needsResubmission,
        reviewers: false,
        confirm: false,
      },
      context
    );
  }
}
