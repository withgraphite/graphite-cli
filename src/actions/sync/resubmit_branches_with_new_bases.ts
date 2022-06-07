import prompts from 'prompts';
import { TContext } from '../../lib/context';
import { SCOPE } from '../../lib/state/scope_spec';
import { Branch } from '../../wrapper-classes/branch';
import { submitAction } from '../submit/submit_action';

export async function resubmitBranchesWithNewBases(
  force: boolean,
  context: TContext
): Promise<void> {
  const branchNames: string[] = [];
  Branch.allBranches(context, {
    filter: (b) => {
      const prState = context.metaCache.getPrInfo(b.name)?.state;
      return (
        !b.isTrunk(context) &&
        b.getParentFromMeta(context) !== undefined &&
        prState !== 'MERGED' &&
        prState !== 'CLOSED'
      );
    },
  }).forEach((b) => {
    const currentBase = b.getParentFromMeta(context)?.name;
    const githubBase = context.metaCache.getPrInfo(b.name)?.base;

    if (githubBase && githubBase !== currentBase) {
      branchNames.push(b.name);
    }
  });

  if (branchNames.length === 0) {
    return;
  }

  context.splog.logNewline();
  context.splog.logInfo(
    [
      `The following branches appear to have been rebased (or cherry-picked) in your local repo but changes have not yet propagated to PR (remote):`,
      ...branchNames.map((b) => `- ${b}`),
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
        scope: SCOPE.STACK,
        editPRFieldsInline: false,
        draftToggle: false,
        dryRun: false,
        updateOnly: false,
        branchNames,
        reviewers: false,
        confirm: false,
      },
      context
    );
  }
}
