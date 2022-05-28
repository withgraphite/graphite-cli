import chalk from 'chalk';
import prompts from 'prompts';
import { TContext } from '../lib/context';
import { KilledError } from '../lib/errors';
import { assertUnreachable } from '../lib/utils/assert_unreachable';
import { getTrunk } from '../lib/utils/trunk';
import { Branch } from '../wrapper-classes/branch';

export async function fixDanglingBranches(
  context: TContext,
  opts: { force: boolean; showSyncTip?: boolean }
): Promise<void> {
  context.splog.logInfo(
    `Ensuring tracked branches in Graphite are all well-formed...`
  );

  if (opts.showSyncTip) {
    context.splog.logInfo(
      `Disable this behavior at any point in the future with --no-show-dangling`
    );
  }

  const danglingBranches = Branch.allBranches(context, {
    filter: (b) =>
      !b.isTrunk(context) && b.getParentFromMeta(context) === undefined,
  });

  if (danglingBranches.length === 0) {
    context.splog.logInfo(`All branches well-formed.`);
    context.splog.logNewline();
    return;
  }

  context.splog.logNewline();
  console.log(
    chalk.yellow(
      `Found branches without a known parent to Graphite. This may cause issues detecting stacks; we recommend you select one of the proposed remediations or use \`gt upstack onto\` to restack the branch onto the appropriate parent.`
    )
  );
  context.splog.logTip(
    `To ensure Graphite always has a known parent for your branch, create your branch through Graphite with \`gt branch create <branch_name>\`.`
  );
  context.splog.logNewline();

  const trunk = getTrunk(context).name;
  for (const branch of danglingBranches) {
    type TFixStrategy = 'parent_trunk' | 'ignore_branch' | 'no_fix' | undefined;
    let fixStrategy: TFixStrategy | undefined = undefined;

    if (opts.force) {
      fixStrategy = 'parent_trunk';
      context.splog.logInfo(`Setting parent of ${branch.name} to ${trunk}.`);
    } else if (!context.interactive) {
      fixStrategy = 'no_fix';
      context.splog.logInfo(
        `Skipping fix in non-interactive mode. Use '--force' to set parent to ${trunk}).`
      );
    }

    if (fixStrategy === undefined) {
      const response = await prompts(
        {
          type: 'select',
          name: 'value',
          message: `${branch.name}`,
          choices: [
            {
              title: `Set ${chalk.green(
                `(${branch.name})`
              )}'s parent to ${trunk}`,
              value: 'parent_trunk',
            },
            {
              title: `Add ${chalk.green(
                `(${branch.name})`
              )} to the list of branches Graphite should ignore`,
              value: 'ignore_branch',
            },
            { title: `Fix later`, value: 'no_fix' },
          ],
        },
        {
          onCancel: () => {
            throw new KilledError();
          },
        }
      );

      switch (response.value) {
        case 'parent_trunk':
          fixStrategy = 'parent_trunk';
          break;
        case 'ignore_branch':
          fixStrategy = 'ignore_branch';
          break;
        case 'no_fix':
        default:
          fixStrategy = 'no_fix';
      }
    }

    switch (fixStrategy) {
      case 'parent_trunk':
        branch.setParentBranchName(trunk);
        break;
      case 'ignore_branch':
        context.repoConfig.addIgnoreBranchPatterns([branch.name]);
        break;
      case 'no_fix':
        break;
      default:
        assertUnreachable(fixStrategy);
    }
  }

  context.splog.logNewline();
}
