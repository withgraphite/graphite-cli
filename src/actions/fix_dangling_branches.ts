import chalk from 'chalk';
import prompts from 'prompts';
import { KilledError } from '../lib/errors';
import { getTrunk, logInfo, logNewline, logTip } from '../lib/utils';
import { Branch } from '../wrapper-classes/branch';
import { TContext } from './../lib/context/context';

export async function fixDanglingBranches(
  context: TContext,
  opts: { force: boolean; showSyncHint?: boolean }
): Promise<void> {
  logInfo(`Ensuring tracked branches in Graphite are all well-formed...`);

  if (opts.showSyncHint) {
    logTip(
      `Disable this behavior at any point in the future with --no-show-dangling`,
      context
    );
  }

  const danglingBranches = Branch.allBranchesWithFilter(
    {
      filter: (b) =>
        !b.isTrunk(context) && b.getParentFromMeta(context) === undefined,
    },
    context
  );

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
    type TFixStrategy = 'parent_trunk' | 'ignore_branch' | 'no_fix' | undefined;
    let fixStrategy: TFixStrategy | undefined = undefined;

    if (opts.force) {
      fixStrategy = 'parent_trunk';
      logInfo(`Setting parent of ${branch.name} to ${trunk}.`);
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

  logNewline();
}

// eslint-disable-next-line @typescript-eslint/no-empty-function
function assertUnreachable(arg: never): void {}
