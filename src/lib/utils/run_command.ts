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

export function runCommandAndSplitLines(
  params: TRunCommandParameters
): string[] {
  return runCommand(params)
    .split('\n')
    .filter((l) => l.length > 0);
}

export function runCommand(params: TRunCommandParameters): string {
  // Only measure if we're with an existing span.
  return tracer.currentSpanId
    ? tracer.spanSync(
        {
          name: 'spawnedCommand',
          resource: 'runCommand',
          meta: { runCommandArgs: cuteString(params) },
        },
        () => {
          return runCommandImpl(params);
        }
      )
    : runCommandImpl(params);
}

function runCommandImpl(params: TRunCommandParameters): string {
  const spawnSyncOutput = spawnSync(params.command, params.args, {
    ...params.options,
    encoding: 'utf-8',
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
