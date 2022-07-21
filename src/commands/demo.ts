import tmp from 'tmp';
import yargs from 'yargs';
import { graphiteWithoutRepo } from '../lib/runner';
import { GitRepo } from '../lib/utils/git_repo';
import { makeId } from '../lib/utils/make_id';
import { runCommand } from '../lib/utils/run_command';

export const command = 'demo';
export const canonical = 'demo';
export const description = false;

const args = {} as const;
export const builder = args;

type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;
export const handler = async (argv: argsT): Promise<void> => {
  return graphiteWithoutRepo(argv, canonical, async (context) => {
    const tmpDir = tmp.dirSync();
    context.splog.info(tmpDir.name);
    const repo = new GitRepo(tmpDir.name);

    const id = makeId(4);

    repo.createChangeAndCommit('First commit');
    repo.createChangeAndCommit('Second commit');

    repo.createChange('[Product] Add review queue filter api');
    runCliCommand(
      [
        'branch',
        'create',
        `branch create 'tr-${id}--review_queue_api`,
        '-m',
        '[Product] Add review queue filter api',
      ],
      tmpDir.name
    );

    repo.createChange('[Product] Add review queue filter server');
    runCliCommand(
      [
        'branch',
        'create',
        `tr-${id}--review_queue_server`,
        '-m',
        '[Product] Add review queue filter server',
      ],
      tmpDir.name
    );

    repo.createChange('[Product] Add review queue filter frontend');
    runCliCommand(
      [
        'branch',
        'create',
        `tr-${id}--review_queue_frontend`,
        '-m',
        '[Product] Add review queue filter frontend',
      ],
      tmpDir.name
    );

    repo.checkoutBranch('main');

    repo.createChange('[Bug Fix] Fix crashes on reload');
    runCliCommand(
      [
        'branch',
        'create',
        `tr-${id}--fix_crash_on_reload`,
        '-m',
        '[Bug Fix] Fix crashes on reload',
      ],
      tmpDir.name
    );

    repo.checkoutBranch('main');

    repo.createChange('[Bug Fix] Account for empty state');
    runCliCommand(
      [
        'branch',
        'create',
        `tr-${id}--account_for_empty_state`,
        '-m',
        '[Bug Fix] Account for empty state',
      ],
      tmpDir.name
    );

    repo.checkoutBranch('main');

    runCommand({
      command: 'git',
      args: [
        'remote',
        'add',
        'origin',
        'git@github.com:withgraphite/graphite-demo-repo.git',
      ],
      options: { cwd: tmpDir.name },
      onError: 'throw',
    });

    runCommand({
      command: 'git',
      args: ['push', 'origin', 'main', '-f'],
      options: { cwd: tmpDir.name },
      onError: 'throw',
    });
  });
};

function runCliCommand(args: string[], fromDir: string) {
  runCommand({
    command: 'gt',
    args,
    options: {
      stdio: 'inherit',
      cwd: fromDir,
    },
    onError: 'throw',
  });
}
