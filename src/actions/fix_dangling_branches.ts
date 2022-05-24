import chalk from 'chalk';
import prompts from 'prompts';
import { execStateConfig } from '../lib/config/exec_state_config';
import { TContext } from '../lib/context';
import { KilledError } from '../lib/errors';
import { assertUnreachable } from '../lib/utils/assert_unreachable';
import { logInfo, logNewline, logTip } from '../lib/utils/splog';
import { getTrunk } from '../lib/utils/trunk';
import { Branch } from '../wrapper-classes/branch';

export async function fixDanglingBranches(
  context: TContext,
  opts: { force: boolean; showSyncTip?: boolean }
): Promise<void> {
  logInfo(`Ensuring tracked branches in Graphite are all well-formed...`);

  if (opts.showSyncTip) {
    logTip(
      `Disable this behavior at any point in the future with --no-show-dangling`,
      context
    );
  }

  const danglingBranches = Branch.allBranches(context, {
    filter: (b) =>
      !b.isTrunk(context) && b.getParentFromMeta(context) === undefined,
  });

  if (danglingBranches.length === 0) {
    logInfo(`All branches well-formed.`);
    logNewline();
    return;
  }

  logNewline();
  console.log(
    chalk.yellow(
      `Found branches without a known parent to Graphite. This may cause issues detecting stacks; we recommend you select one of the proposed remediations or use \`gt upstack onto\` to restack the branch onto the appropriate parent.`
    )
  );
  logTip(
    `To ensure Graphite always has a known parent for your branch, create your branch through Graphite with \`gt branch create <branch_name>\`.`,
    context
  );
  logNewline();

  const trunk = getTrunk(context).name;
  for (const branch of danglingBranches) {
    type TFixStrategy = 'parent_trunk' | 'no_fix' | undefined;
    let fixStrategy: TFixStrategy | undefined = undefined;

    if (opts.force) {
      fixStrategy = 'parent_trunk';
      logInfo(`Setting parent of ${branch.name} to ${trunk}.`);
    } else if (!execStateConfig.interactive()) {
      fixStrategy = 'no_fix';
      logInfo(
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
        case 'no_fix':
        default:
          fixStrategy = 'no_fix';
      }
    }

    switch (fixStrategy) {
      case 'parent_trunk':
        branch.setParentBranchName(trunk);
        break;
      case 'no_fix':
        break;
      default:
        assertUnreachable(fixStrategy);
    }
  }

  logNewline();
}
