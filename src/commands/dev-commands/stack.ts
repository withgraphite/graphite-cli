import { execSync } from 'child_process';
import yargs from 'yargs';
import { currentGitRepoPrecondition } from '../../lib/preconditions';
import { profile } from '../../lib/telemetry';
import { makeId } from '../../lib/utils';
import { GitRepo } from '../../lib/utils/git_repo';

export const command = 'create-stack';
export const canonical = 'create-stack';
export const aliases = ['cs'];
export const description = false;

const args = {} as const;
export const builder = args;

type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;
export const handler = async (argv: argsT): Promise<void> => {
  return profile(argv, canonical, async () => {
    const repoPath = currentGitRepoPrecondition();
    const repo = new GitRepo(repoPath, {
      existingRepo: true,
    });

    const id = makeId(4);

    repo.createChange('[1/3] Add review queue filter api');
    execCliCommand(
      `branch create '${id}--a' -m '[Product] Add review queue filter api'`
    );

    repo.createChange('[2/3] Add review queue filter server');
    execCliCommand(
      `branch create '${id}--b' -m '[Product] Add review queue filter server'`
    );

    repo.createChange('[3/3] Add review queue filter frontend');
    execCliCommand(
      `branch create '${id}--c' -m '[Product] Add review queue filter frontend'`
    );
  });
};

function execCliCommand(command: string) {
  execSync(`gt ${command}`, {
    stdio: 'inherit',
  });
}
