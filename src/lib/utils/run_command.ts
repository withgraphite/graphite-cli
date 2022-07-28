import { spawnSync, SpawnSyncOptions } from 'child_process';
import { CommandFailedError, KilledError } from '../errors';
import { cuteString } from './cute_string';
import { tracer } from './tracer';

type TRunCommandParameters = {
  command: string;
  args: string[];
  options?: Omit<SpawnSyncOptions, 'encoding'>;
  onError: (() => void) | 'throw' | 'ignore';
};

export function runGitCommandAndSplitLines(
  params: Omit<TRunCommandParameters, 'command'> & { resource: string | null }
): string[] {
  return runGitCommand(params)
    .split('\n')
    .filter((l) => l.length > 0);
}

export function runGitCommand(
  params: Omit<TRunCommandParameters, 'command'> & { resource: string | null }
): string {
  // Only measure if we're with an existing span.
  return params.resource && tracer.currentSpanId
    ? tracer.spanSync(
        {
          name: 'spawnedCommand',
          resource: params.resource,
          meta: { runCommandArgs: cuteString(params) },
        },
        () => {
          return runCommand({ command: 'git', ...params });
        }
      )
    : runCommand({ command: 'git', ...params });
}

export function runCommand(params: TRunCommandParameters): string {
  const spawnSyncOutput = spawnSync(params.command, params.args, {
    ...params.options,
    encoding: 'utf-8',
    // 1MB should be enough to never have to worry about this
    maxBuffer: 1024 * 1024 * 1024,
  });

  // this is a syscall failure, not a command failure
  if (spawnSyncOutput.error) {
    throw spawnSyncOutput.error;
  }

  // if killed with a signal
  if (spawnSyncOutput.signal) {
    throw new KilledError();
  }

  // command succeeded, return output
  if (!spawnSyncOutput.status) {
    return spawnSyncOutput.stdout?.trim() || '';
  }

  // command failed but we ignore it
  if (params.onError === 'ignore') {
    return '';
  }

  // if a lambda is passed, first we run it, then throw
  if (params.onError !== 'throw') {
    params.onError();
  }

  throw new CommandFailedError({
    command: params.command,
    args: params.args,
    status: spawnSyncOutput.status,
    stdout: spawnSyncOutput.stdout,
    stderr: spawnSyncOutput.stderr,
  });
}
