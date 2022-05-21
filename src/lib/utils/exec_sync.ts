import { execSync, ExecSyncOptions, SpawnSyncReturns } from 'child_process';
import { tracer } from '../telemetry/tracer';

export type GPExecSyncOptions = {
  // Output is always returned (like normal execSync).  This option lets us
  // print it.  A lambda allows us to mutate the displayed output.
  printStdout?: boolean | ((out: string) => string);
} & Omit<ExecSyncOptions, 'encoding'>;

export function gpExecSync(
  command: {
    command: string;
    options?: GPExecSyncOptions;
  },
  onError?: (e: Error & SpawnSyncReturns<string>) => void
): string {
  try {
    // Only measure if we're with an existing span.
    if (tracer.currentSpanId) {
      return tracer.spanSync(
        {
          name: 'execSync',
          resource: 'gpExecSync',
          meta: { command: command.command },
        },
        () => {
          return gpExecSyncImpl(command);
        }
      );
    } else {
      return gpExecSyncImpl(command);
    }
  } catch (e) {
    onError?.(e);
    return '';
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
  if (command.options?.printStdout === true) {
    console.log(output);
  } else if (command.options?.printStdout) {
    console.log(command.options?.printStdout(output));
  }
  return output.trim();
}
