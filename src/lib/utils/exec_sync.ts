import { execSync, ExecSyncOptions } from 'child_process';
import { CommandFailedError } from '../errors';
import { cuteString } from './cute_string';
import { TSplog } from './splog';
import { tracer } from './tracer';

type GPExecSyncOptions = {
  // Output is always returned (like normal execSync).  This option lets us
  // print it.  A lambda allows us to mutate the displayed output.
  printStdout?: {
    splog: TSplog;
    transform?: (out: string) => string;
  };
} & Omit<ExecSyncOptions, 'encoding'>;

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
  options?: ExecSyncOptions & GPExecSyncOptions;
}): string {
  const output =
    execSync(command.command, {
      ...command.options,
      encoding: 'utf-8',
    }) ?? ''; // this can return null, which is dumb
  if (command.options?.printStdout) {
    command.options.printStdout.splog.info(
      command.options.printStdout.transform
        ? command.options.printStdout.transform(output)
        : output
    );
  }
  return output.trim();
}
