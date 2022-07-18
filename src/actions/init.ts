import chalk from 'chalk';
import prompts from 'prompts';
import { TContext } from '../lib/context';
import {
  ExitFailedError,
  KilledError,
  PreconditionsFailedError,
} from '../lib/errors';
import { findRemoteBranch } from '../lib/git/find_remote_branch';
import { suggest } from '../lib/utils/prompts_helpers';
import { checkoutBranch } from './checkout_branch';
import { trackBranchInteractive } from './track_branch';

export async function init(
  args: {
    trunk?: string;
    reset?: boolean;
  },
  context: TContext
): Promise<void> {
  const allBranchNames = context.metaCache.allBranchNames;

  context.splog.info(
    context.repoConfig.graphiteInitialized()
      ? `Reinitializing Graphite...`
      : `Welcome to Graphite!`
  );
  context.splog.newline();

  if (allBranchNames.length === 0) {
    throw new PreconditionsFailedError(
      [
        `No branches found in current repo; cannot initialize Graphite.`,
        `Please create your first commit and then re-run your Graphite command.`,
      ].join('\n')
    );
  }

  const newTrunkName: string =
    (args.trunk ? allBranchNames.find((b) => b === args.trunk) : undefined) ??
    (await selectTrunkBranch(allBranchNames, context));

  context.repoConfig.setTrunk(newTrunkName);
  context.splog.info(`Trunk set to ${chalk.green(newTrunkName)}`);

  if (args.reset) {
    context.metaCache.reset(newTrunkName);
    context.splog.info(`All branches have been untracked`);
  } else {
    context.metaCache.rebuild(newTrunkName);
  }
  context.splog.newline();

  if (context.interactive) {
    await branchOnboardingFlow(context);
  }
}

async function selectTrunkBranch(
  allBranchNames: string[],
  context: TContext
): Promise<string> {
  const inferredTrunk =
    findRemoteBranch(context.repoConfig.getRemote()) ??
    findCommonlyNamedTrunk(context);

  if (!context.interactive) {
    if (inferredTrunk) {
      return inferredTrunk;
    } else {
      throw new ExitFailedError(
        `Could not infer trunk branch, pass in an existing branch name with --trunk or run in interactive mode.`
      );
    }
  }

  return (
    await prompts(
      {
        type: 'autocomplete',
        name: 'branch',
        message: `Select a trunk branch, which you open pull requests against${
          inferredTrunk ? ` - inferred trunk ${chalk.green(inferredTrunk)}` : ''
        } (autocomplete or arrow keys)`,
        choices: allBranchNames.map((b) => {
          return { title: b, value: b };
        }),
        ...(inferredTrunk ? { initial: inferredTrunk } : {}),
        suggest,
      },
      {
        onCancel: () => {
          throw new KilledError();
        },
      }
    )
  ).branch;
}

function findCommonlyNamedTrunk(context: TContext): string | undefined {
  const potentialTrunks = context.metaCache.allBranchNames.filter((b) =>
    ['main', 'master', 'development', 'develop'].includes(b)
  );
  if (potentialTrunks.length === 1) {
    return potentialTrunks[0];
  }
  return undefined;
}

async function branchOnboardingFlow(context: TContext) {
  context.splog.tip(
    [
      "If you have an existing branch or stack that you'd like to start working on with Graphite, you can begin tracking it now!",
      'To add other non-Graphite branches to Graphite later, check out `gt branch track`.',
      'If you only want to use Graphite for new branches, feel free to exit now and use `gt branch create`.',
    ].join('\n')
  );
  if (
    !(
      await prompts(
        {
          type: 'confirm',
          name: 'value',
          message: `Would you like start tracking existing branches to create your first stack?`,
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

  await checkoutBranch({ branchName: context.metaCache.trunk }, context);
  while (await trackBranchInteractive(context));
}
