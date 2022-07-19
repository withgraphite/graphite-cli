import { execSync, ExecSyncOptions } from 'child_process';
import { CommandFailedError } from '../errors';
import { cuteString } from './cute_string';
import { tracer } from './tracer';

type GPExecSyncOptions = Omit<ExecSyncOptions, 'encoding'>;

export function gpExecSyncAndSplitLines(
  ...args: Parameters<typeof gpExecSync>
): string[] {
  return gpExecSync(...args)
    .split('\n')
    .filter((l) => l.length > 0);
}

export function gpExecSync(command: {
  command: string;
  options?: GPExecSyncOptions;
  onError: (() => void) | 'throw' | 'ignore';
}): string {
  try {
    // Only measure if we're with an existing span.
    if (tracer.currentSpanId) {
      return tracer.spanSync(
        {
          name: 'execSync',
          resource: 'gpExecSync',
          meta: { command: cuteString(command) },
        },
        () => {
          return gpExecSyncImpl(command);
        }
      );
    } else {
      return gpExecSyncImpl(command);
    }
  } catch (e) {
    if (command.onError === 'ignore') {
      return '';
    }
    // if a lambda is passed, first we run it, then throw
    if (command.onError !== 'throw') {
      command.onError?.();
    }
    throw new CommandFailedError(
      command.command,
      e.stdout || '',
      e.stderr || ''
    );
  }
}

function gpExecSyncImpl(command: {
  command: string;
  options?: GPExecSyncOptions;
}): string {
  const output =
    execSync(command.command, {
      ...command.options,
      encoding: 'utf-8',
    }) ?? ''; // this can return null, which is dumb
  return output.trim();
}
