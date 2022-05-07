import { execSync } from 'child_process';
import tmp from 'tmp';
import yargs from 'yargs';
import { profile } from '../lib/telemetry/profile';
import { GitRepo } from '../lib/utils/git_repo';
import { makeId } from '../lib/utils/make_id';

export const command = 'demo';
export const canonical = 'demo';
export const description = false;

const args = {} as const;
export const builder = args;

type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;
export const handler = async (argv: argsT): Promise<void> => {
  return profile(argv, canonical, async () => {
    const tmpDir = tmp.dirSync();
    console.log(tmpDir.name);
    const repo = new GitRepo(tmpDir.name);

    const id = makeId(4);

    repo.createChangeAndCommit('First commit');
    repo.createChangeAndCommit('Second commit');

    repo.createChange('[Product] Add review queue filter api');
    execCliCommand(
      `branch create 'tr-${id}--review_queue_api' -m '[Product] Add review queue filter api'`,
      { fromDir: tmpDir.name }
    );

    repo.createChange('[Product] Add review queue filter server');
    execCliCommand(
      `branch create 'tr-${id}--review_queue_server' -m '[Product] Add review queue filter server'`,
      { fromDir: tmpDir.name }
    );

    repo.createChange('[Product] Add review queue filter frontend');
    execCliCommand(
      `branch create 'tr-${id}--review_queue_frontend' -m '[Product] Add review queue filter frontend'`,
      { fromDir: tmpDir.name }
    );

    repo.checkoutBranch('main');

    repo.createChange('[Bug Fix] Fix crashes on reload');
    execCliCommand(
      `branch create 'tr-${id}--fix_crash_on_reload' -m '[Bug Fix] Fix crashes on reload'`,
      { fromDir: tmpDir.name }
    );

    repo.checkoutBranch('main');

    repo.createChange('[Bug Fix] Account for empty state');
    execCliCommand(
      `branch create 'tr-${id}--account_for_empty_state' -m '[Bug Fix] Account for empty state'`,
      { fromDir: tmpDir.name }
    );

    repo.checkoutBranch('main');

    execSync(
      'git remote add origin git@github.com:withgraphite/graphite-demo-repo.git',
      { cwd: tmpDir.name }
    );
    execSync('git push origin main -f', { cwd: tmpDir.name });
  });
};

function execCliCommand(command: string, opts: { fromDir: string }) {
  execSync(`gt ${command}`, {
    stdio: 'inherit',
    cwd: opts.fromDir,
  });
}
