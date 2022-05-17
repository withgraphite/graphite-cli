import chalk from 'chalk';
import cp from 'child_process';
import { assertIsError } from './errors';
import { logError, logInfo } from './utils/splog';

const GIT_COMMAND_ALLOWLIST = [
  'add',
  'am',
  'apply',
  'archive',
  'bisect',
  'blame',
  'bundle',
  'cherry-pick',
  'clean',
  'clone',
  'diff',
  'difftool',
  'fetch',
  'format-patch',
  'fsck',
  'grep',
  'merge',
  'mv',
  'notes',
  'pull',
  'push',
  'range-diff',
  'rebase',
  'reflog',
  'remote',
  'request-pull',
  'reset',
  'restore',
  'revert',
  'rm',
  'show',
  'send-email',
  'sparse-checkout',
  'stash',
  'status',
  'submodule',
  'switch',
  'tag',
];

export function passthrough(args: string[]): void {
  if (args.length <= 2) {
    return;
  }

  const command = args[2];
  if (!GIT_COMMAND_ALLOWLIST.includes(command)) {
    return;
  }

  logInfo(
    chalk.grey(
      [
        `Command: "${chalk.yellow(
          command
        )}" is not a Graphite command, but is supported by git. Passing command through to git...`,
        `Running: "${chalk.yellow(`git ${args.slice(2).join(' ')}`)}"\n`,
      ].join('\n')
    )
  );

  try {
    cp.spawnSync('git', args.slice(2), { stdio: 'inherit' });
  } catch (err) {
    assertIsError(err);
    logError(err.message);
    // eslint-disable-next-line no-restricted-syntax
    process.exit(1);
  }
  // eslint-disable-next-line no-restricted-syntax
  process.exit(0);
}
