import chalk from 'chalk';
import fs from 'fs-extra';
import prompts from 'prompts';
import { TContext } from '../lib/context';
import { PreconditionsFailedError } from '../lib/errors';
import { branchExists } from '../lib/git/branch_exists';
import { getRepoRootPathPrecondition } from '../lib/preconditions';
import { inferTrunk } from '../lib/utils/trunk';
import { Branch } from '../wrapper-classes/branch';
export async function init(
  context: TContext,
  trunk?: string,
  ignoreBranches?: string[]
): Promise<void> {
  getRepoRootPathPrecondition();
  const allBranches = Branch.allBranches(context);

  logWelcomeMessage(context);
  context.splog.logNewline();

  /**
   * When a branch new repo is created, it technically has 0 branches as a
   * branch doesn't become 'born' until it has a commit on it. In this case,
   * we exit early from init - which will continue to run and short-circuit
   * until the repo has a proper commit.
   *
   * https://newbedev.com/git-branch-not-returning-any-results
   */
  if (allBranches.length === 0) {
    context.splog.logError(
      `Ouch! We can't setup Graphite in a repo without any branches -- this is likely because you're initializing Graphite in a blank repo. Please create your first commit and then re-run your Graphite command.`
    );
    context.splog.logNewline();
    throw new PreconditionsFailedError(
      `No branches found in current repo; cannot initialize Graphite.`
    );
  }

  // Trunk
  let newTrunkName: string;
  if (trunk) {
    if (branchExists(trunk)) {
      newTrunkName = trunk;
      context.repoConfig.setTrunk(newTrunkName);
      context.splog.logInfo(`Trunk set to (${newTrunkName})`);
    } else {
      throw new PreconditionsFailedError(
        `Cannot set (${trunk}) as trunk, branch not found in current repo.`
      );
    }
  } else {
    newTrunkName = await selectTrunkBranch(allBranches, context);
    context.repoConfig.setTrunk(newTrunkName);
  }

  // Ignore Branches
  if (ignoreBranches) {
    ignoreBranches.forEach((branchName) => {
      if (!branchExists(branchName)) {
        throw new PreconditionsFailedError(
          `Cannot set (${branchName}) to be ignore, branch not found in current repo.`
        );
      }
    });
    context.repoConfig.addIgnoreBranchPatterns(ignoreBranches);
  } else {
    let ignoreBranches = await selectIgnoreBranches(allBranches, newTrunkName);
    context.splog.logInfo(
      `Selected following branches to ignore: ${ignoreBranches}`
    );
    if (!ignoreBranches) {
      ignoreBranches = [];
    }
    context.repoConfig.addIgnoreBranchPatterns(ignoreBranches);
  }

  context.splog.logInfo(
    `Graphite repo config saved at "${context.repoConfig.path}"`
  );
  context.splog.logInfo(fs.readFileSync(context.repoConfig.path).toString());
}

function logWelcomeMessage(context: TContext): void {
  if (!context.repoConfig.graphiteInitialized()) {
    context.splog.logInfo('Welcome to Graphite!');
  } else {
    context.splog.logInfo(
      `Regenerating Graphite repo config (${context.repoConfig.path})`
    );
  }
}

async function selectIgnoreBranches(
  allBranches: Branch[],
  trunk: string
): Promise<string[]> {
  const branchesWithoutTrunk = allBranches.filter((b) => b.name != trunk);
  if (branchesWithoutTrunk.length === 0) {
    return [];
  }
  const response = await prompts({
    type: 'multiselect',
    name: 'branches',
    message: `Ignore Branches: select any permanent branches never to be stacked (such as "prod" or "staging"). ${chalk.yellow(
      'Fine to select none.'
    )}`,
    choices: branchesWithoutTrunk.map((b) => {
      return { title: b.name, value: b.name };
    }),
  });
  return response.branches;
}

async function selectTrunkBranch(
  allBranches: Branch[],
  context: TContext
): Promise<string> {
  const trunk = inferTrunk(context);
  const response = await prompts({
    type: 'autocomplete',
    name: 'branch',
    message: `Select a trunk branch, which you open pull requests against${
      trunk ? ` [inferred trunk (${chalk.green(trunk.name)})]` : ''
    }`,
    choices: allBranches.map((b) => {
      return { title: b.name, value: b.name };
    }),
    ...(trunk ? { initial: trunk.name } : {}),
  });
  return response.branch;
}
