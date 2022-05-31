import chalk from 'chalk';
import prompts from 'prompts';
import { TContext } from '../../lib/context';
import { writeMetadataRef } from '../../lib/engine/metadata_ref';
import { KilledError } from '../../lib/errors';
import { copyFromRemote } from '../../lib/git/copy_from_remote';
import { getBranchRevision } from '../../lib/git/get_branch_revision';
import { getMergeBase } from '../../lib/git/merge_base';
import { Branch } from '../../wrapper-classes/branch';
import { syncPrInfo } from '../sync_pr_info';

export async function mergeDownstack(
  downstack: string[],
  context: TContext
): Promise<void> {
  const overwrittenBranches = calculateOverwrittenBranches(downstack, context);
  if (overwrittenBranches.length) {
    context.splog.logWarn(
      `'downstack sync' is still in development and does not yet support merging local changes.`
    );
    context.splog.logWarn(
      `The following branches' histories will be overwritten if you continue:\n${overwrittenBranches.join(
        '\n'
      )}`
    );

    if (
      !(
        await prompts(
          {
            type: 'confirm',
            name: 'value',
            message: `Discard local changes and sync from ${context.repoConfig.getRemote()}?`,
            initial: false,
          },
          {
            onCancel: () => {
              throw new KilledError();
            },
          }
        )
      ).value
    ) {
      return;
    }
    context.splog.logNewline();
  }

  let parent = context.metaCache.trunk;
  for (const branchName of downstack) {
    // TODO - fully move this logic to cache
    copyFromRemote(branchName, context.repoConfig.getRemote());
    // using merge-base here handles the first branch gracefully (can be off trunk)
    // while still ensuring the rest of the branches have correct data
    writeMetadataRef(branchName, {
      parentBranchName: parent,
      parentBranchRevision: getMergeBase(branchName, parent),
    });

    context.splog.logInfo(
      `${chalk.green(branchName)} synced from ${context.repoConfig.getRemote()}`
    );

    parent = branchName;
  }

  await syncPrInfo(downstack, context);
}

function calculateOverwrittenBranches(
  downstack: string[],
  context: TContext
): string[] {
  return downstack.filter((branchName) => {
    const branch = Branch.allBranches(context).find(
      (b) => b.name === branchName
    );
    if (!branch) {
      return false;
    }

    return (
      getMergeBase(
        branchName,
        `${context.repoConfig.getRemote()}/${branchName}`
      ) !== getBranchRevision(branchName)
    );
  });
}
