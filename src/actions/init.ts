import chalk from 'chalk';
import prompts from 'prompts';
import { TContext } from '../lib/context';
import { ExitFailedError, PreconditionsFailedError } from '../lib/errors';
import { findRemoteBranch } from '../lib/git/find_remote_branch';

export async function init(context: TContext, trunk?: string): Promise<void> {
  const allBranchNames = context.metaCache.allBranchNames;

  logWelcomeMessage(context);
  context.splog.newline();

  /**
   * When a branch new repo is created, it technically has 0 branches as a
   * branch doesn't become 'born' until it has a commit on it. In this case,
   * we exit early from init - which will continue to run and short-circuit
   * until the repo has a proper commit.
   *
   * https://newbedev.com/git-branch-not-returning-any-results
   */
  if (allBranchNames.length === 0) {
    context.splog.error(
      `Ouch! We can't setup Graphite in a repo without any branches -- this is likely because you're initializing Graphite in a blank repo. Please create your first commit and then re-run your Graphite command.`
    );
    context.splog.newline();
    throw new PreconditionsFailedError(
      `No branches found in current repo; cannot initialize Graphite.`
    );
  }

  const newTrunkName: string =
    (trunk ? allBranchNames.find((b) => b === trunk) : undefined) ??
    (await selectTrunkBranch(allBranchNames, context));

  context.repoConfig.setTrunk(newTrunkName);
  context.metaCache.rebuild(newTrunkName);

  context.splog.info(`Trunk set to ${chalk.green(newTrunkName)}`);
  context.splog.info(
    `Graphite repo config saved at "${context.repoConfig.path}"`
  );
}

function logWelcomeMessage(context: TContext): void {
  if (!context.repoConfig.graphiteInitialized()) {
    context.splog.info('Welcome to Graphite!');
  } else {
    context.splog.info(
      `Regenerating Graphite repo config (${context.repoConfig.path})`
    );
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
    await prompts({
      type: 'autocomplete',
      name: 'branch',
      message: `Select a trunk branch, which you open pull requests against${
        inferredTrunk ? ` - inferred trunk ${chalk.green(inferredTrunk)}` : ''
      } (autocomplete or arrow keys)`,
      choices: allBranchNames.map((b) => {
        return { title: b, value: b };
      }),
      ...(inferredTrunk ? { initial: inferredTrunk } : {}),
    })
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
