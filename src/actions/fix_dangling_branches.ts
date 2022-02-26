import chalk from 'chalk';
import prompts from 'prompts';
import { KilledError } from '../lib/errors';
import { getTrunk, logInfo } from '../lib/utils';
import { Branch } from '../wrapper-classes/branch';
import { TContext } from './../lib/context/context';

export function existsDanglingBranches(context: TContext): boolean {
  const danglingBranches = Branch.allBranchesWithFilter(
    {
      filter: (b) =>
        !b.isTrunk(context) && b.getParentFromMeta(context) === undefined,
    },
    context
  );
  return danglingBranches.length > 0;
}

export async function fixDanglingBranches(
  context: TContext,
  force: boolean
): Promise<void> {
  const danglingBranches = Branch.allBranchesWithFilter(
    {
      filter: (b) =>
        !b.isTrunk(context) && b.getParentFromMeta(context) === undefined,
    },
    context
  );

  const trunk = getTrunk(context).name;
  for (const branch of danglingBranches) {
    type TFixStrategy = 'parent_trunk' | 'ignore_branch' | 'no_fix' | undefined;
    let fixStrategy: TFixStrategy | undefined = undefined;

    if (force) {
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
}

// eslint-disable-next-line @typescript-eslint/no-empty-function
function assertUnreachable(arg: never): void {}
